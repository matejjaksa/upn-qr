#!/bin/bash
set -e
echo "Pushing UPN QR to production git remote..."
git push production main
echo "Done."
