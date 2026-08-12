#!/usr/bin/env bash
# ============================================================================
# GitHub profile overhaul — run AFTER `gh auth login` succeeds.
#   bash branding/apply-github.sh
# Everything here is reversible (descriptions/bio can be re-edited any time).
# ============================================================================
set -euo pipefail

command -v gh >/dev/null || { echo "gh CLI not found"; exit 1; }
gh auth status >/dev/null || { echo "Run: gh auth login"; exit 1; }

PORTFOLIO_URL="${PORTFOLIO_URL:-}"   # export PORTFOLIO_URL=https://... before running, or edit here

echo "── 1. Profile bio / location / website"
gh api -X PATCH /user \
  -f bio="Software Engineer — Full-Stack, APIs & AI/ML. Founding engineer of CelerSCET (campus ERP on React · Node.js · PostgreSQL · GCP). IEEE-published." \
  -f location="Kerala, India" \
  ${PORTFOLIO_URL:+-f blog="$PORTFOLIO_URL"} >/dev/null
echo "   done"

echo "── 2. Profile README (Aleena24/Aleena24)"
TMP=$(mktemp -d)
git clone -q https://github.com/Aleena24/Aleena24 "$TMP/profile"
cp "$(dirname "$0")/github-profile-README.md" "$TMP/profile/README.md"
if [ -n "$PORTFOLIO_URL" ]; then
  sed -i "s|<PORTFOLIO_URL>|$PORTFOLIO_URL|g" "$TMP/profile/README.md"
fi
cd "$TMP/profile"
git add README.md
git -c user.name="Aleena Varghese" -c user.email="aleenatheresa024@gmail.com" \
  commit -q -m "Profile README: software engineer positioning, selected work, links"
git push -q origin HEAD
cd - >/dev/null
echo "   pushed"

echo "── 3. Repository descriptions + topics"
gh repo edit Aleena24/Aleena24-portfolio \
  --description "Personal portfolio — dark editorial single-page site with a custom canvas 3D scene. Vanilla JS, zero frameworks." \
  --add-topic portfolio --add-topic vanilla-js >/dev/null
gh repo edit Aleena24/srgan_cloud \
  --description "GAN-based cloud removal for satellite imagery (U-Net + ResNet, EuroSAT) — published at IEEE ICECCC 2025." \
  --add-topic gan --add-topic pytorch --add-topic satellite-imagery --add-topic ieee >/dev/null
gh repo edit Aleena24/real-image-SRGAN \
  --description "SRGAN experiments on real-image super-resolution — research notebooks." \
  --add-topic gan --add-topic super-resolution >/dev/null
gh repo edit Aleena24/ZeroCodeML-V1.0 \
  --description "No-code machine learning platform — upload a CSV, get automated EDA and trained models. React + Flask." \
  --add-topic machine-learning --add-topic no-code --add-topic react --add-topic flask >/dev/null
gh repo edit Aleena24/ZeroCodeML-V2.0-main \
  --description "ZeroCodeML V2 — next iteration of the no-code machine learning platform." >/dev/null
gh repo edit Aleena24/HostingCloudly \
  --description "Frontend dashboard for Hosting Cloudly — cloud hosting platform: uploads, deployment tracking, performance metrics. React + Supabase." \
  --add-topic react --add-topic cloud >/dev/null
gh repo edit Aleena24/EduQuest \
  --description "Generates MCQs and long/short-answer questions from uploaded PDFs and web content. Python + NLP + Streamlit." \
  --add-topic nlp --add-topic streamlit >/dev/null
gh repo edit Aleena24/SentimentLens \
  --description "LLM-powered sentiment analysis API for customer reviews. Python." \
  --add-topic llm --add-topic sentiment-analysis >/dev/null
gh repo edit Aleena24/College-management-system \
  --description "College management system (2023) — attendance, results and faculty tools. Early precursor to my ERP work." >/dev/null
echo "   done"

echo "── 4. (Optional) archive coursework repos — uncomment to apply"
# for r in ML_Lab ML-TEST NLP_MLProject AML_lab Java_practicals cyberSecurity_Lab \
#          Big-Data-Analytics Deep-Learning Natural-Language-Processing- Computer-Vision \
#          reinforcement-learning Predictive_Analysis SpeechProcessing AML_project_HAR \
#          Java_project_ImageEnhancing Medium_repo Psyliq- PRODIGY_ML; do
#   gh repo archive "Aleena24/$r" --yes && echo "   archived $r"
# done

cat <<'DONE'

── 5. Manual steps (no API exists for these)
   • Pin these 6 repos (profile → Customize your pins):
       Aleena24-portfolio · srgan_cloud · ZeroCodeML-V1.0 ·
       HostingCloudly · EduQuest · SentimentLens
   • Profile photo: keep the current headshot (it is the brand photo everywhere now).

All done.
DONE
