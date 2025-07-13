#!/bin/bash
# 가상 시리얼 포트 생성 스크립트

echo "가상 시리얼 포트 쌍 생성 중..."

# socat으로 가상 시리얼 포트 쌍 생성
socat -d -d pty,raw,echo=0 pty,raw,echo=0 &
SOCAT_PID=$!

sleep 2

echo "PID: $SOCAT_PID로 실행 중"
echo "Ctrl+C로 중지"

wait $SOCAT_PID