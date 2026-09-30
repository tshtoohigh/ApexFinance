<#
.SYNOPSIS
    Verifies an RS Finance update actually works, end to end.

.DESCRIPTION
    Checks the things that silently break after an update, in order:

      1. Environment      - Node/npm present and new enough
      2. Repo state       - on main, up to date with origin, clean tree
      3. Version wiring   - package.json and src/lib/version.ts agree
      4. Dependencies     - node_modules installed
      5. Build            - tsc -b && vite build, and dist/ output is real
      6. Database         - all 9 Supabase tables reachable via the REST API
      7. Version gate     - app_config row exists and is readable
      8. Security         - anon key cannot read other people's rows
      9. Auth config      - email confirmation is off (the classic login blocker)
     10. Crypto prices    - CoinGecko reachable

    Supabase URL and anon key are read from src/lib/supabase.ts, so there is
    nothing to configure and no key duplicated into this script.

    Every check is READ-ONLY. Nothing is written to your database.

.PARAMETER SkipBuild
    Skip dependency install and the production build (the slow part).

.PARAMETER SkipDb
    Skip all network checks (Supabase + CoinGecko).

.PARAMETER Serve
    Start the dev server after all checks pass.

.EXAMPLE
    .\scripts\test-update.ps1
    Run the full suite.

.EXAMPLE
    .\scripts\test-update.ps1 -SkipBuild -Serve
    Just verify the database, then start the app.
#>

[CmdletBinding()]
param(
    [switch]$SkipBuild,
    [switch]$SkipDb,
    [switch]$Serve
)

# Deliberately NOT 'Stop'. In PowerShell 5.1, redirecting a native command's
# stderr (npm 2>&1) wraps those lines in ErrorRecord objects, and with
# ErrorActionPreference='Stop' a routine npm warning would abort the script.
# Checks that need to trap failures use -ErrorAction Stop explicitly instead.
$ErrorActionPreference = 'Continue'

# PowerShell 5.1 defaults to TLS 1.0, which Supabase rejects.
try {
    [Net.ServicePointManager]::SecurityProtocol =
        [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12
} catch { }

$RepoRoot = Split-Path -Parent $PSScriptRoot
$IsPS7    = $PSVersionTable.PSVersion.Major -ge 6

# ---------------------------------------------------------------------------
# Result tracking
# ---------------------------------------------------------------------------

$Results = New-Object System.Collections.ArrayList

function Add-Result {
    param(
        [string]$Name,
        [ValidateSet('PASS', 'FAIL', 'WARN', 'SKIP')][string]$Status,
        [string]$Detail = ''
    )

    [void]$Results.Add([pscustomobject]@{
        Name   = $Name
        Status = $Status
        Detail = $Detail
    })

    $color = switch ($Status) {
        'PASS' { 'Green' }
        'FAIL' { 'Red' }
        'WARN' { 'Yellow' }
        'SKIP' { 'DarkGray' }
    }
    $tag = '[{0}]' -f $Status.PadRight(4)

    Write-Host "  $tag " -ForegroundColor $color -NoNewline
    Write-Host $Name -NoNewline
    if ($Detail) {
        Write-Host "  $Detail" -ForegroundColor DarkGray
    } else {
        Write-Host ''
    }
}

function Write-Section {
    param([string]$Title)
    Write-Host ''
    Write-Host $Title -ForegroundColor Cyan
    Write-Host ('-' * $Title.Length) -ForegroundColor DarkGray
}

# ---------------------------------------------------------------------------
# HTTP helper that never throws on 4xx/5xx, on both PS 5.1 and PS 7
# ---------------------------------------------------------------------------

function Invoke-Api {
    param(
        [string]$Uri,
        [hashtable]$Headers = @{},
        [int]$TimeoutSec = 20
    )

    if ($IsPS7) {
        try {
            $r = Invoke-WebRequest -Uri $Uri -Headers $Headers -Method GET `
                    -TimeoutSec $TimeoutSec -SkipHttpErrorCheck -ErrorAction Stop
            return [pscustomobject]@{
                Status = [int]$r.StatusCode
                Body   = [string]$r.Content
                Error  = $null
            }
        } catch {
            return [pscustomobject]@{ Status = 0; Body = ''; Error = $_.Exception.Message }
        }
    }

    # PowerShell 5.1: non-2xx throws, so dig the response out of the exception.
    try {
        $r = Invoke-WebRequest -Uri $Uri -Headers $Headers -Method GET `
                -TimeoutSec $TimeoutSec -UseBasicParsing -ErrorAction Stop
        return [pscustomobject]@{
            Status = [int]$r.StatusCode
            Body   = [string]$r.Content
            Error  = $null
        }
    } catch {
        $resp = $null
        try { $resp = $_.Exception.Response } catch { }

        if ($resp) {
            $code = 0
            try { $code = [int]$resp.StatusCode } catch { }
            $body = ''
            try {
                $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
                $body = $reader.ReadToEnd()
                $reader.Close()
            } catch { }
            return [pscustomobject]@{ Status = $code; Body = $body; Error = $null }
        }

        return [pscustomobject]@{ Status = 0; Body = ''; Error = $_.Exception.Message }
    }
}

function ConvertFrom-JsonSafe {
    param([string]$Text)
    if ([string]::IsNullOrWhiteSpace($Text)) { return $null }
    try { return $Text | ConvertFrom-Json } catch { return $null }
}

# ---------------------------------------------------------------------------

Write-Host ''
Write-Host '================================================' -ForegroundColor White
Write-Host ' RS FINANCE - UPDATE VERIFICATION' -ForegroundColor White
Write-Host ' Powered by RS Corp' -ForegroundColor DarkGray
Write-Host '================================================' -ForegroundColor White
Write-Host " Repo: $RepoRoot" -ForegroundColor DarkGray
Write-Host " PowerShell: $($PSVersionTable.PSVersion)" -ForegroundColor DarkGray

Push-Location $RepoRoot
try {

# ===========================================================================
Write-Section '1. Environment'
# ===========================================================================

$nodeVersion = $null
try {
    $nodeVersion = (& node --version 2>$null | Out-String).Trim()
} catch { }

if (-not $nodeVersion) {
    Add-Result 'Node.js installed' 'FAIL' 'node not found on PATH - install from nodejs.org'
} else {
    $major = 0
    $m = [regex]::Match($nodeVersion, '^v(\d+)')
    if ($m.Success) { $major = [int]$m.Groups[1].Value }

    if ($major -ge 18) {
        Add-Result 'Node.js version' 'PASS' "$nodeVersion (need >= v18)"
    } else {
        Add-Result 'Node.js version' 'FAIL' "$nodeVersion is too old - Vite 5 needs v18+"
    }
}

$npmVersion = $null
try {
    $npmVersion = (& npm --version 2>$null | Out-String).Trim()
} catch { }

if ($npmVersion) {
    Add-Result 'npm available' 'PASS' "v$npmVersion"
} else {
    Add-Result 'npm available' 'FAIL' 'npm not found on PATH'
}

# ===========================================================================
Write-Section '2. Repository state'
# ===========================================================================

$gitOk = $false
try {
    $null = & git rev-parse --is-inside-work-tree 2>$null
    $gitOk = ($LASTEXITCODE -eq 0)
} catch { }

if (-not $gitOk) {
    Add-Result 'Git repository' 'WARN' 'not a git repo - skipping sync checks'
} else {
    $branch = (& git rev-parse --abbrev-ref HEAD 2>$null | Out-String).Trim()
    Add-Result 'Current branch' $(if ($branch -eq 'main') { 'PASS' } else { 'WARN' }) $branch

    $dirty = (& git status --porcelain 2>$null | Out-String).Trim()
    if ($dirty) {
        $count = ($dirty -split "`n").Count
        Add-Result 'Working tree clean' 'WARN' "$count file(s) modified locally"
    } else {
        Add-Result 'Working tree clean' 'PASS'
    }

    # Are we actually running the latest code?
    $fetched = $false
    try {
        & git fetch origin main --quiet 2>$null
        $fetched = ($LASTEXITCODE -eq 0)
    } catch { }

    if (-not $fetched) {
        Add-Result 'Up to date with origin' 'WARN' 'could not reach origin (offline?)'
    } else {
        $local  = (& git rev-parse HEAD 2>$null | Out-String).Trim()
        $remote = (& git rev-parse origin/main 2>$null | Out-String).Trim()

        if ($local -eq $remote) {
            Add-Result 'Up to date with origin/main' 'PASS' $local.Substring(0, 7)
        } else {
            $behind = (& git rev-list --count "HEAD..origin/main" 2>$null | Out-String).Trim()
            Add-Result 'Up to date with origin/main' 'FAIL' `
                "$behind commit(s) behind - run: git pull origin main"
        }
    }
}

# ===========================================================================
Write-Section '3. Version wiring'
# ===========================================================================

$pkgVersion = $null
$appVersion = $null

$pkgPath = Join-Path $RepoRoot 'package.json'
if (Test-Path $pkgPath) {
    $pkg = ConvertFrom-JsonSafe (Get-Content $pkgPath -Raw)
    if ($pkg) { $pkgVersion = $pkg.version }
}

$verPath = Join-Path $RepoRoot 'src\lib\version.ts'
if (Test-Path $verPath) {
    $vm = [regex]::Match((Get-Content $verPath -Raw), "APP_VERSION\s*=\s*'([^']+)'")
    if ($vm.Success) { $appVersion = $vm.Groups[1].Value }
}

if (-not $pkgVersion -or -not $appVersion) {
    Add-Result 'Version readable' 'FAIL' 'could not parse package.json or version.ts'
} elseif ($pkgVersion -eq $appVersion) {
    Add-Result 'package.json matches version.ts' 'PASS' "v$pkgVersion"
} else {
    Add-Result 'package.json matches version.ts' 'FAIL' `
        "package.json=$pkgVersion but APP_VERSION=$appVersion - the version gate will misbehave"
}

# ===========================================================================
Write-Section '4. Dependencies and build'
# ===========================================================================

if ($SkipBuild) {
    Add-Result 'Dependencies' 'SKIP' '-SkipBuild was passed'
    Add-Result 'Production build' 'SKIP' '-SkipBuild was passed'
} else {
    $needInstall = -not (Test-Path (Join-Path $RepoRoot 'node_modules\vite'))

    if ($needInstall) {
        Write-Host '       installing dependencies (this can take a minute)...' -ForegroundColor DarkGray
        & npm install --no-audit --no-fund 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Add-Result 'npm install' 'PASS' 'dependencies installed'
        } else {
            Add-Result 'npm install' 'FAIL' "npm install exited $LASTEXITCODE"
        }
    } else {
        Add-Result 'Dependencies present' 'PASS' 'node_modules already installed'
    }

    # npm run build is "tsc -b && vite build", so this typechecks too.
    Write-Host '       building (tsc + vite)...' -ForegroundColor DarkGray
    $buildLog = & npm run build 2>&1 | Out-String

    if ($LASTEXITCODE -eq 0) {
        Add-Result 'Production build' 'PASS' 'tsc + vite build succeeded'
    } else {
        Add-Result 'Production build' 'FAIL' "exited $LASTEXITCODE - see output below"
        Write-Host ''
        Write-Host '--- build output (last 40 lines) ---' -ForegroundColor Red
        ($buildLog -split "`r?`n" | Select-Object -Last 40) | ForEach-Object {
            Write-Host "  $_" -ForegroundColor DarkGray
        }
        Write-Host '--- end build output ---' -ForegroundColor Red
    }

    # A zero exit code is not proof the output is usable - check the artifacts.
    $distIndex = Join-Path $RepoRoot 'dist\index.html'
    if (Test-Path $distIndex) {
        $jsCount = @(Get-ChildItem (Join-Path $RepoRoot 'dist\assets') -Filter '*.js' -ErrorAction SilentlyContinue).Count
        $cssCount = @(Get-ChildItem (Join-Path $RepoRoot 'dist\assets') -Filter '*.css' -ErrorAction SilentlyContinue).Count

        if ($jsCount -gt 0 -and $cssCount -gt 0) {
            Add-Result 'Build output valid' 'PASS' "dist/: index.html + $jsCount js + $cssCount css"
        } else {
            Add-Result 'Build output valid' 'FAIL' `
                "dist/assets is missing JS or CSS (js=$jsCount css=$cssCount)"
        }
    } else {
        Add-Result 'Build output valid' 'FAIL' 'dist/index.html was not produced'
    }
}

# ===========================================================================
Write-Section '5. Supabase database'
# ===========================================================================

$TABLES = @(
    'profiles', 'accounts', 'crypto_holdings', 'subscriptions',
    'goals', 'transactions', 'net_worth_history', 'physical_assets', 'app_config'
)

if ($SkipDb) {
    Add-Result 'Database checks' 'SKIP' '-SkipDb was passed'
} else {
    $sbPath = Join-Path $RepoRoot 'src\lib\supabase.ts'
    $sbUrl = $null
    $sbKey = $null

    if (Test-Path $sbPath) {
        $sbRaw = Get-Content $sbPath -Raw
        $um = [regex]::Match($sbRaw, "SUPABASE_URL\s*=\s*'([^']+)'")
        $km = [regex]::Match($sbRaw, "SUPABASE_ANON_KEY\s*=\s*'([^']+)'")
        if ($um.Success) { $sbUrl = $um.Groups[1].Value.TrimEnd('/') }
        if ($km.Success) { $sbKey = $km.Groups[1].Value }
    }

    if (-not $sbUrl -or -not $sbKey) {
        Add-Result 'Supabase credentials' 'FAIL' "could not read URL/anon key from src\lib\supabase.ts"
    } else {
        Add-Result 'Supabase credentials' 'PASS' $sbUrl

        $headers = @{
            'apikey'        = $sbKey
            'Authorization' = "Bearer $sbKey"
            'Accept'        = 'application/json'
        }

        # --- Table existence ------------------------------------------------
        # Missing table  -> 404 PGRST205 "Could not find the table ..."
        # RLS-blocked    -> 200 with [] (RLS filters rows, it does not error)
        $missing = @()
        $present = @()
        $weird   = @()

        foreach ($t in $TABLES) {
            $r = Invoke-Api -Uri "$sbUrl/rest/v1/$t`?select=*&limit=1" -Headers $headers

            if ($r.Status -eq 200) {
                $present += $t
            } elseif ($r.Status -eq 404) {
                $missing += $t
            } elseif ($r.Status -eq 0) {
                $weird += "$t (no response: $($r.Error))"
            } else {
                $j = ConvertFrom-JsonSafe $r.Body
                $msg = if ($j -and $j.message) { $j.message } else { "HTTP $($r.Status)" }
                $weird += "$t ($msg)"
            }
        }

        if ($present.Count -eq $TABLES.Count) {
            Add-Result 'All 9 tables exist' 'PASS' ($present -join ', ')
        } else {
            if ($missing.Count -gt 0) {
                Add-Result 'All 9 tables exist' 'FAIL' `
                    "missing: $($missing -join ', ') - run supabase\schema.sql"
            }
            if ($weird.Count -gt 0) {
                Add-Result 'Table check errors' 'FAIL' ($weird -join '; ')
            }
        }

        # --- Version gate ---------------------------------------------------
        # app_config is the one table with a public read policy, so a row here
        # proves the seed INSERT ran AND the RLS policies were applied.
        if ($present -contains 'app_config') {
            $r = Invoke-Api -Uri "$sbUrl/rest/v1/app_config?select=*" -Headers $headers
            $rows = @(ConvertFrom-JsonSafe $r.Body)

            if ($rows.Count -ge 1 -and $rows[0].latest_version) {
                $cfg = $rows[0]
                Add-Result 'Version gate configured' 'PASS' `
                    "min=$($cfg.min_version) latest=$($cfg.latest_version)"

                # Would this build be blocked by its own gate?
                if ($appVersion -and $cfg.min_version) {
                    $blocked = $false
                    try {
                        $blocked = ([version]$appVersion -lt [version]$cfg.min_version)
                    } catch { }

                    if ($blocked) {
                        Add-Result 'This build is allowed' 'FAIL' `
                            "v$appVersion is below min_version $($cfg.min_version) - the app will show Update Required"
                    } else {
                        Add-Result 'This build is allowed' 'PASS' "v$appVersion >= min $($cfg.min_version)"
                    }
                }
            } else {
                Add-Result 'Version gate configured' 'FAIL' `
                    'app_config returned no rows - the seed INSERT or its read policy is missing'
            }
        }

        # --- Security: anon must not see user data --------------------------
        $leaked = @()
        foreach ($t in @('profiles', 'accounts', 'transactions', 'physical_assets', 'goals')) {
            if ($present -notcontains $t) { continue }
            $r = Invoke-Api -Uri "$sbUrl/rest/v1/$t`?select=*&limit=5" -Headers $headers
            $rows = @(ConvertFrom-JsonSafe $r.Body)
            if ($rows.Count -gt 0) { $leaked += "$t ($($rows.Count) rows)" }
        }

        if ($leaked.Count -gt 0) {
            Add-Result 'RLS blocks anonymous reads' 'FAIL' `
                "anon key can read: $($leaked -join ', ') - your data is PUBLIC"
        } else {
            Add-Result 'RLS blocks anonymous reads' 'PASS' `
                'anon sees 0 rows in user tables (note: also true of an empty DB)'
        }

        # --- Auth: is email confirmation off? -------------------------------
        $r = Invoke-Api -Uri "$sbUrl/auth/v1/settings" -Headers @{ 'apikey' = $sbKey }
        $settings = ConvertFrom-JsonSafe $r.Body

        if ($r.Status -eq 200 -and $settings) {
            $autoconfirm = $null
            if ($null -ne $settings.mailer_autoconfirm) { $autoconfirm = [bool]$settings.mailer_autoconfirm }

            if ($autoconfirm -eq $true) {
                Add-Result 'Email confirmation disabled' 'PASS' 'signups log in immediately'
            } elseif ($autoconfirm -eq $false) {
                Add-Result 'Email confirmation disabled' 'WARN' `
                    'ON - you will hit "Email not confirmed". Auth > Providers > Email > uncheck Confirm email'
            } else {
                Add-Result 'Email confirmation setting' 'WARN' 'mailer_autoconfirm not reported by this project'
            }

            if ($settings.disable_signup -eq $true) {
                Add-Result 'Signups enabled' 'FAIL' 'signups are disabled in Supabase - you cannot register'
            } else {
                Add-Result 'Signups enabled' 'PASS'
            }
        } else {
            Add-Result 'Auth settings readable' 'WARN' "HTTP $($r.Status) from /auth/v1/settings"
        }
    }

    # --- CoinGecko ----------------------------------------------------------
    $r = Invoke-Api -Uri 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd' -TimeoutSec 20
    if ($r.Status -eq 200) {
        $j = ConvertFrom-JsonSafe $r.Body
        $btc = if ($j -and $j.bitcoin) { $j.bitcoin.usd } else { $null }
        if ($btc) {
            Add-Result 'CoinGecko live prices' 'PASS' "BTC = `$$btc USD"
        } else {
            Add-Result 'CoinGecko live prices' 'WARN' 'responded 200 but no price in payload'
        }
    } elseif ($r.Status -eq 429) {
        Add-Result 'CoinGecko live prices' 'WARN' 'rate limited (429) - free tier, will retry in app'
    } else {
        Add-Result 'CoinGecko live prices' 'WARN' "HTTP $($r.Status) - crypto values will show as stale"
    }
}

# ===========================================================================
# Summary
# ===========================================================================

$pass = @($Results | Where-Object { $_.Status -eq 'PASS' }).Count
$fail = @($Results | Where-Object { $_.Status -eq 'FAIL' }).Count
$warn = @($Results | Where-Object { $_.Status -eq 'WARN' }).Count
$skip = @($Results | Where-Object { $_.Status -eq 'SKIP' }).Count

Write-Host ''
Write-Host '================================================' -ForegroundColor White
Write-Host " RESULT: $pass passed, $fail failed, $warn warnings, $skip skipped" -ForegroundColor White
Write-Host '================================================' -ForegroundColor White

if ($fail -gt 0) {
    Write-Host ''
    Write-Host 'Failures that need fixing:' -ForegroundColor Red
    $Results | Where-Object { $_.Status -eq 'FAIL' } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Detail)" -ForegroundColor Red
    }
    Write-Host ''
    Write-Host 'Most common cause: supabase\schema.sql has not been run yet.' -ForegroundColor Yellow
    Write-Host 'Open it, copy all of it, paste into the Supabase SQL Editor, click Run.' -ForegroundColor Yellow
    Write-Host ''
    exit 1
}

if ($warn -gt 0) {
    Write-Host ''
    Write-Host 'Warnings (app will run, but read these):' -ForegroundColor Yellow
    $Results | Where-Object { $_.Status -eq 'WARN' } | ForEach-Object {
        Write-Host "  - $($_.Name): $($_.Detail)" -ForegroundColor Yellow
    }
}

Write-Host ''
Write-Host 'Update verified.' -ForegroundColor Green

if ($Serve) {
    Write-Host ''
    Write-Host 'Starting dev server - open http://localhost:5173 (Ctrl+C to stop)' -ForegroundColor Cyan
    Write-Host ''
    & npm run dev
} else {
    Write-Host 'Start the app with:  npm run dev' -ForegroundColor DarkGray
    Write-Host 'Or on your phone:    npm run dev -- --host' -ForegroundColor DarkGray
    Write-Host ''
}

exit 0

} finally {
    Pop-Location
}
