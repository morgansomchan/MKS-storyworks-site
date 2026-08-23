#!/bin/bash
# Run this after editing copy:   ./check.sh
# It does not change anything — it only tells you whether the page is still intact.

cd "$(dirname "$0")" || exit 1
fail=0
ok(){   printf "  \033[32m✓\033[0m %s\n" "$1"; }
bad(){  printf "  \033[31m✗\033[0m %s\n" "$1"; fail=1; }

want(){ # want <label> <pattern> <expected-count>
  n=$(grep -c "$2" index.html)
  if [ "$n" -eq "$3" ]; then ok "$1 ($n)"; else bad "$1 — expected $3, found $n"; fi
}

echo "Structure"
want "sections"            '<section'            9
want "no System section"   'THE SYSTEM'          0
want "pills"               'class="pill'         8
want "counters"            'class="n odo\|class="odo' 6
want "funnel cone"         'class="cone"'        1
want "ecosystem nodes"     'data-eco='           5
want "service panes"       'class="svc-pane'     5
want "service buttons"     'class="svc-item"'    5
want "carousel"            'data-carousel'       1
want "gallery slides"      'class="slide"'       22
want "case photos"         'case-media'          1
want "FAQ items"           'class="qa reveal"'   8

echo
echo "Links and files"
missing=0
for f in $(grep -o 'assets/[a-z]*/[A-Za-z0-9._-]*\.\(jpg\|png\|mp4\)' index.html | sort -u); do
  case "$f" in *vsl*) continue;; esac      # the VSL block is commented out
  [ -f "$f" ] || { bad "missing file: $f"; missing=1; }
done
[ "$missing" -eq 0 ] && ok "every image and video referenced exists"

for f in styles.css script.js; do
  grep -q "$f" index.html && ok "$f is linked" || bad "$f is NOT linked"
done

echo
echo "Tag balance"
for t in section div; do
  o=$(grep -o "<$t[ >]" index.html | wc -l | tr -d ' ')
  c=$(grep -o "</$t>" index.html | wc -l | tr -d ' ')
  if [ "$o" -eq "$c" ]; then ok "<$t> balanced ($o)"; else bad "<$t> unbalanced — $o open, $c close"; fi
done

echo
if [ "$fail" -eq 0 ]; then
  printf "\033[32mAll good — safe to deploy.\033[0m\n"
else
  printf "\033[31mSomething is off. Restore from _site-backups and try again.\033[0m\n"
fi
exit $fail
