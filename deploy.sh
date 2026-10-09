# 途中のコマンドが失敗したらそこで止める
set -e

git push --tags
npm run build

COMMENT="$1"
VERSION="$2"

if [ -z "${COMMENT}" ]; then
  echo "コミットコメントは必須です。コミットを省略する場合「-」を指定してください"
  exit 1
fi

if [ "${COMMENT}" != "-" ]; then
  git add -A
  # 変更が無いと git commit が失敗して set -e で止まるので、変更がある時だけコミットする
  if ! git diff --cached --quiet; then
    git commit -m "${COMMENT}"
  fi
  git push
fi

# 前回のタグから新しいコミットが無ければ中止 (空のバージョンを作らないため)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || true)
if [ -n "${LAST_TAG}" ] && [ "$(git rev-list "${LAST_TAG}..HEAD" --count)" -eq 0 ]; then
  echo "${LAST_TAG} 以降の新しいコミットがありません。リリースを中止します"
  exit 1
fi

case "${VERSION}" in
  "major")
    npm version major ;;
  "minor")
    npm version minor ;;
  *)
    npm version patch ;;
esac

git push --follow-tags

npm publish
