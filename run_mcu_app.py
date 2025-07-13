#!/usr/bin/env python3
"""
MCU RS232 통신 프로그램 실행 스크립트
"""

import subprocess
import sys
import os

def run_app():
    """MCU 시리얼 통신 앱 실행"""
    try:
        # Python 경로 확인
        python_path = sys.executable
        app_path = os.path.join(os.path.dirname(__file__), "mcu_serial_app.py")
        
        print("MCU RS232 통신 프로그램을 시작합니다...")
        print(f"Python: {python_path}")
        print(f"앱 경로: {app_path}")
        
        # 앱 실행
        subprocess.run([python_path, app_path])
        
    except Exception as e:
        print(f"실행 오류: {e}")
        input("아무 키나 누르세요...")

if __name__ == "__main__":
    run_app()