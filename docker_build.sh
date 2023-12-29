#!/bin/bash

ACCOUNTID=${1}
REGION=${2}
ECR_REPO_NAME=${3}
AWS_PROFILE=${4}

ARG_ENV=aws

ECR_REPO_URI="${ACCOUNTID}.dkr.ecr.${REGION}.amazonaws.com/${ECR_REPO_NAME}"

echo "ECR_REPO_URI: ${ECR_REPO_URI}"

aws ecr get-login-password --region ${REGION} --profile ${AWS_PROFILE} | docker login --username AWS --password-stdin ${ACCOUNTID}.dkr.ecr.${REGION}.amazonaws.com
# docker buildx build --platform linux/amd64 -f ./docker/aws/${ECR_REPO_NAME}/Dockerfile -t ${ECR_REPO_NAME} .
docker buildx build --build-arg ARG_ENV=${ARG_ENV} --platform linux/amd64 -f ./docker/${ECR_REPO_NAME}/Dockerfile -t ${ECR_REPO_NAME} .
docker tag ${ECR_REPO_NAME}:latest ${ECR_REPO_URI}:latest
docker push ${ECR_REPO_URI}:latest
