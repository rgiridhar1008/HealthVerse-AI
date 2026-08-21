git init
git add .
git commit -m "Update UI and Landing Page"
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/rgiridhar1008/HealthVerse-AI.git
git push -u origin main
