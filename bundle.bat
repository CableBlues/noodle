@echo off
chcp 65001 > nul
set OUTPUT_FILE=projekt_code.txt

echo ===================================================
echo 🍜 Noodle Studio - Code-Bundler
echo ===================================================
echo.
echo Erstelle Bundle aller vollständigen Quellcodes...
echo Ziel-Datei: %OUTPUT_FILE%
echo.

:: Alte Bundle-Datei löschen
if exist %OUTPUT_FILE% del %OUTPUT_FILE%

:: Header schreiben
echo # ============================================================================== >> %OUTPUT_FILE%
echo # NOODLE STUDIO — GESAMTER QUELLCODE DER ANWENDUNG >> %OUTPUT_FILE%
echo # Stand: %DATE% %TIME% >> %OUTPUT_FILE%
echo # ============================================================================== >> %OUTPUT_FILE%
echo. >> %OUTPUT_FILE%

:: 1. HTML, Manifest & Configs
for %%f in (index.html manifest.json package.json vitest.config.js config.js tailwind.config.js tailwind.input.css supabase-policies.sql) do (
    if exist "%%f" (
        echo [x] Fuege %%f hinzu...
        echo. >> %OUTPUT_FILE%
        echo ============================================================================== >> %OUTPUT_FILE%
        echo DATEI: %%f >> %OUTPUT_FILE%
        echo ============================================================================== >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
        type "%%f" >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
    )
)

:: 2. Alle CSS-Dateien
for %%f in (*.css) do (
    echo [x] Fuege %%f hinzu...
    echo. >> %OUTPUT_FILE%
    echo ============================================================================== >> %OUTPUT_FILE%
    echo DATEI: %%f >> %OUTPUT_FILE%
    echo ============================================================================== >> %OUTPUT_FILE%
    echo. >> %OUTPUT_FILE%
    type "%%f" >> %OUTPUT_FILE%
    echo. >> %OUTPUT_FILE%
)

:: 3. Alle JS-Dateien im Hauptverzeichnis
for %%f in (*.js) do (
    if "%%f" neq "%OUTPUT_FILE%" (
        echo [x] Fuege %%f hinzu...
        echo. >> %OUTPUT_FILE%
        echo ============================================================================== >> %OUTPUT_FILE%
        echo DATEI: %%f >> %OUTPUT_FILE%
        echo ============================================================================== >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
        type "%%f" >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
    )
)

:: 4. Alle Test-Dateien in tests/
for %%f in (tests\*.js) do (
    if exist "%%f" (
        echo [x] Fuege %%f hinzu...
        echo. >> %OUTPUT_FILE%
        echo ============================================================================== >> %OUTPUT_FILE%
        echo DATEI: %%f >> %OUTPUT_FILE%
        echo ============================================================================== >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
        type "%%f" >> %OUTPUT_FILE%
        echo. >> %OUTPUT_FILE%
    )
)

echo.
echo ===================================================
echo ✨ Fertig! Der gesamte Code wurde gebündelt in:
echo    %CD%\%OUTPUT_FILE%
echo ===================================================
echo.
pause
