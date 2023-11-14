#!/bin/bash

ACCOUNTID=${1}
REGION=${2}
ECR_REPO_NAME=${3}
AWS_PROFILE=${4}

ECR_REPO_URI="${ACCOUNTID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "ECR_REPO_URI: ${ECR_REPO_URI}"

aws ecr get-login-password --region ${REGION} --profile ${AWS_PROFILE} | docker login --username AWS --password-stdin ${ACCOUNTID}.dkr.ecr.${REGION}.amazonaws.com
docker build --platform linux/x86_64 -t ${ECR_REPO_NAME} ./docker/nginx
docker tag ${ECR_REPO_NAME}:latest ${ECR_REPO_URI}:latest
docker push ${ECR_REPO_URI}:latest
