@echo off
setlocal EnableDelayedExpansion
set "OUTPUT_FILE=projekt_code.txt"

echo ===================================================
echo  Noodle Studio - Code Bundler
echo ===================================================
echo.
echo Erstelle Bundle aller Quellcodes in: %OUTPUT_FILE%
echo.

if exist "%OUTPUT_FILE%" del "%OUTPUT_FILE%"

REM Schreibe Header
(
echo ==============================================================================
echo NOODLE STUDIO - GESAMTER QUELLCODE DER ANWENDUNG
echo Stand: %DATE% %TIME%
echo ==============================================================================
echo.
) > "%OUTPUT_FILE%"

REM 1. Basis-Dateien und Konfigurationen
for %%F in (index.html manifest.json package.json vitest.config.js config.js tailwind.config.js tailwind.input.css supabase-policies.sql UPDATE_PLAN.md) do (
    if exist "%%F" (
        echo [x] Fuege %%F hinzu...
        (
            echo.
            echo ==============================================================================
            echo DATEI: %%F
            echo ==============================================================================
            echo.
            type "%%F"
            echo.
        ) >> "%OUTPUT_FILE%"
    )
)

REM 2. Alle CSS-Dateien
for %%F in (*.css) do (
    echo [x] Fuege %%F hinzu...
    (
        echo.
        echo ==============================================================================
        echo DATEI: %%F
        echo ==============================================================================
        echo.
        type "%%F"
        echo.
    ) >> "%OUTPUT_FILE%"
)

REM 3. Alle JavaScript-Dateien im Hauptverzeichnis
for %%F in (*.js) do (
    if /I not "%%F"=="app.bundle.js" (
        echo [x] Fuege %%F hinzu...
        (
            echo.
            echo ==============================================================================
            echo DATEI: %%F
            echo ==============================================================================
            echo.
            type "%%F"
            echo.
        ) >> "%OUTPUT_FILE%"
    )
)

REM 4. Alle Tests in tests
if exist "tests" (
    for %%F in (tests\*.js) do (
        echo [x] Fuege %%F hinzu...
        (
            echo.
            echo ==============================================================================
            echo DATEI: %%F
            echo ==============================================================================
            echo.
            type "%%F"
            echo.
        ) >> "%OUTPUT_FILE%"
    )
)

REM 5. Alle MJS-Dateien (Root und scripts)
for %%F in (*.mjs scripts\*.mjs) do (
    if exist "%%F" (
        echo [x] Fuege %%F hinzu...
        (
            echo.
            echo ==============================================================================
            echo DATEI: %%F
            echo ==============================================================================
            echo.
            type "%%F"
            echo.
        ) >> "%OUTPUT_FILE%"
    )
)

REM 6. JSON-Dateien in scripts (z. B. onclick-baseline.json)
if exist "scripts" (
    for %%F in (scripts\*.json) do (
        if exist "%%F" (
            echo [x] Fuege %%F hinzu...
            (
                echo.
                echo ==============================================================================
                echo DATEI: %%F
                echo ==============================================================================
                echo.
                type "%%F"
                echo.
            ) >> "%OUTPUT_FILE%"
        )
    )
)

echo.
echo ===================================================
echo  Fertig! Der gesamte Code wurde gebuendelt in:
echo    %CD%\%OUTPUT_FILE%
echo ===================================================
echo.
pause
