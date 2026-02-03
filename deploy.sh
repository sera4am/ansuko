git push --tags
npm run build

COMMENT="$1"

if [ -z "${COMMENT}" ]; then
  echo "コメントは必須です"
  exit 1
fi

git add -A
git commit -m "${COMMENT}"
git push

npm version patch
git push --tags

npm publish
