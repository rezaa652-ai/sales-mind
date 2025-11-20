#!/usr/bin/env bash
set -euo pipefail

echo "== Signup Detector =="
echo "pwd: $(pwd)"
echo

has() { command -v "$1" >/dev/null 2>&1; }
GREP="grep"
if has rg; then GREP="rg -n --no-heading"; else GREP="grep -Rni"; fi

# 1) NextAuth present?
NEXTAUTH_PKG=$(grep -Rni '"next-auth"' package.json 2>/dev/null || true)
NEXTAUTH_ROUTE=$($GREP "\[\.{3\}nextauth\]" app 2>/dev/null || true)
if [ -z "$NEXTAUTH_ROUTE" ]; then
  NEXTAUTH_ROUTE=$($GREP "\[\.{3\}nextauth\]" pages 2>/dev/null || true)
fi

# 2) Supabase client-side signup usage?
SUPA_CLIENT_SIGNUP=$($GREP "supabase\.auth\.signUp\s*\(" app 2>/dev/null || true)

# 3) Custom API routes for auth?
AUTH_ROUTES=$(find app -type f \( -path "*/api/*" -o -path "*/auth/*" \) -name "*.ts" -o -name "*.tsx" 2>/dev/null | tr '\n' ' ')
if [ -z "$AUTH_ROUTES" ]; then AUTH_ROUTES=$(find pages -type f -path "*/api/*" -name "*.ts" -o -name "*.tsx" 2>/dev/null | tr '\n' ' '); fi

FORMDATA_READ=$($GREP "req\.formData\(\)|request\.formData\(\)" app 2>/dev/null || true)
JSON_READ=$($GREP "req\.json\(\)|request\.json\(\)" app 2>/dev/null || true)

# 4) Classify
echo "---- Signals found ----"
[ -n "$NEXTAUTH_PKG" ]   && echo "• package.json references next-auth"
[ -n "$NEXTAUTH_ROUTE" ] && echo "• NextAuth route file found: $NEXTAUTH_ROUTE"
[ -n "$SUPA_CLIENT_SIGNUP" ] && echo "• Client-side Supabase signup usage: $SUPA_CLIENT_SIGNUP"
[ -n "$FORMDATA_READ" ]  && echo "• Routes reading formData(): $FORMDATA_READ"
[ -n "$JSON_READ" ]      && echo "• Routes reading json(): $JSON_READ"
echo

type="UNKNOWN"
if [ -n "$NEXTAUTH_PKG" ] || [ -n "$NEXTAUTH_ROUTE" ]; then
  type="NEXTAUTH"
elif [ -n "$SUPA_CLIENT_SIGNUP" ]; then
  type="SUPABASE_CLIENT"
elif [ -n "$FORMDATA_READ" ]; then
  type="CUSTOM_FORMDATA"
elif [ -n "$JSON_READ" ]; then
  type="CUSTOM_JSON"
fi

echo "== DETECTED SIGNUP TYPE: $type =="
echo

# 5) Helpful file lists
echo "---- Likely relevant files ----"
echo "NextAuth route(s):"
$GREP "\[\.{3\}nextauth\]" app pages 2>/dev/null || true
echo
echo "Auth API routes:"
find app -type f -path "*/api/*" -name "route.ts" 2>/dev/null | sed 's/^/  - /'
find pages -type f -path "*/api/*" -name "*.ts" 2>/dev/null | sed 's/^/  - /'
echo
echo "Client signup callsites (supabase.auth.signUp):"
$GREP "supabase\.auth\.signUp\s*\(" app 2>/dev/null || true
echo
echo "Reads formData():"
$GREP "req\.formData\(\)|request\.formData\(\)" app 2>/dev/null || true
echo
echo "Reads json():"
$GREP "req\.json\(\)|request\.json\(\)" app 2>/dev/null || true
echo "------------------------"
