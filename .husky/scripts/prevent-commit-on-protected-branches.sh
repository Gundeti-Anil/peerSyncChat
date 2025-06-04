#!/bin/sh
branch_name="$(git symbolic-ref HEAD 2>/dev/null)" || branch_name="(unnamed branch)"
branch_name=${branch_name##refs/heads/}

if [ "$branch_name" = "main" ] || [ "$branch_name" = "develop" ]; then
  echo "❌ You are not allowed to commit directly to the $branch_name branch!"
  echo ""
  echo "🔄 To safely move your changes to another branch and commit:"
  echo "1. Stash your changes (if needed) with:"
  echo "   git stash"
  echo ""
  echo "2. Create a new branch or switch to an existing one:"
  echo "   git checkout -b PS-1234   # To create and switch to a new branch"
  echo "   git checkout PS-1234      # To switch to an existing branch"
  echo ""
  echo "3. Apply your stashed changes (if you used git stash):"
  echo "   git stash apply"
  echo ""
  echo "4. Commit your changes on the new branch:"
  echo "   git commit -m 'feat: your commit message'"
  echo ""
  echo "5. Push your new branch to the remote repository:"
  echo "   git push origin PS-1234"
  echo "   # or if the branch does not exist on the remote yet"
  echo "   git push --set-upstream origin PS-1234"
  exit 1
fi