# MCU RS232 통신 프로그램

Qt와 Python을 사용하여 MCU보드와 안정적인 RS232 시리얼 통신을 수행하는 응용프로그램입니다.

## 기능

### 🔌 시리얼 통신
- **다양한 포트 지원**: COM, USB-Serial, 가상 포트
- **완전한 설정 제어**: 보드레이트, 데이터 비트, 정지 비트, 패리티
- **안정적인 연결**: 자동 재연결, 오류 복구
- **실시간 모니터링**: 송수신 데이터 실시간 표시

### 📊 데이터 처리
- **다중 포맷 지원**: ASCII, HEX, 바이너리 데이터
- **타임스탬프**: 모든 송수신 데이터에 정확한 시간 기록
- **버퍼링**: 안정적인 대용량 데이터 처리
- **자동 스크롤**: 실시간 데이터 추적

### 🎛️ 사용자 인터페이스
- **직관적인 GUI**: 모든 기능에 쉽게 접근
- **빠른 명령**: 자주 사용하는 명령어 버튼
- **설정 저장**: 연결 설정 자동 기억
- **콘솔 모드**: GUI 없이 명령행에서 사용 가능

## 파일 구조

```
MCU_Serial_Project/
├── mcu_serial_app.py          # 메인 GUI 애플리케이션
├── mcu_serial_console.py      # 콘솔 버전
├── run_mcu_app.py            # 실행 스크립트
├── create_virtual_serial.sh   # 가상 포트 생성 (테스트용)
└── README_MCU_Serial.md      # 이 파일
```

## 설치 및 실행

### 필요한 라이브러리
```bash
pip install PySide6 pyserial
```

### GUI 버전 실행
```bash
python3 mcu_serial_app.py
```

### 콘솔 버전 실행
```bash
# 대화형 모드
python3 mcu_serial_console.py

# 포트 목록 확인
python3 mcu_serial_console.py --list

# 자동 테스트
python3 mcu_serial_console.py --test
```

## 사용법

### 1. GUI 버전 사용법

#### 연결 설정
1. **포트 선택**: 드롭다운에서 연결할 시리얼 포트 선택
2. **통신 설정**: 보드레이트, 데이터 비트, 정지 비트, 패리티 설정
3. **연결**: "연결" 버튼 클릭

#### 데이터 전송
- **일반 텍스트**: 입력창에 데이터 입력 후 "전송" 버튼 또는 Enter
- **HEX 모드**: "HEX 모드" 체크 후 16진수 데이터 입력 (예: "48 65 6C 6C 6F")
- **빠른 명령**: 사전 정의된 명령 버튼 사용 (AT, RST, STATUS 등)

#### 수신 데이터
- **실시간 표시**: 수신된 모든 데이터가 타임스탬프와 함께 표시
- **자동 스크롤**: 새 데이터가 오면 자동으로 스크롤
- **데이터 지우기**: "지우기" 버튼으로 화면 정리

### 2. 콘솔 버전 사용법

#### 기본 명령어
```
> list         # 사용 가능한 포트 목록
> connect      # 포트 연결 (대화형)
> send         # 데이터 전송 (대화형)
> send AT      # 빠른 전송
> quit         # 종료
```

#### 연결 예시
```
> list
=== 사용 가능한 시리얼 포트 ===
1. /dev/ttyUSB0 - USB Serial
2. /dev/ttyACM0 - Arduino

> connect
포트 번호를 선택하세요 (1-2): 1
보드레이트 [115200]: 9600
✅ 연결됨: /dev/ttyUSB0 (보드레이트: 9600)
```

## 통신 설정 가이드

### 일반적인 MCU 설정
| MCU 종류 | 보드레이트 | 데이터 비트 | 정지 비트 | 패리티 |
|----------|------------|-------------|-----------|--------|
| Arduino | 9600/115200 | 8 | 1 | None |
| ESP32/ESP8266 | 115200 | 8 | 1 | None |
| STM32 | 115200/38400 | 8 | 1 | None |
| PIC | 9600/19200 | 8 | 1 | None |

### RS232 레벨 변환
- **MCU는 보통 3.3V/5V TTL 레벨**을 사용
- **RS232는 ±12V 레벨**을 사용
- **MAX232** 같은 레벨 변환기 필요

## 테스트 환경

### 가상 시리얼 포트 생성 (Linux)
```bash
# 스크립트 실행 권한 부여
chmod +x create_virtual_serial.sh

# 가상 포트 쌍 생성
./create_virtual_serial.sh
```

### 루프백 테스트
1. TX와 RX 핀을 물리적으로 연결
2. 전송한 데이터가 그대로 수신되는지 확인
3. "Hello"를 보내면 "Hello"가 수신되어야 함

## 문제 해결

### 연결 문제
```
❌ 연결 오류: [Errno 13] Permission denied: '/dev/ttyUSB0'
```
**해결**: 사용자를 dialout 그룹에 추가
```bash
sudo usermod -a -G dialout $USER
```

### 데이터 수신 안됨
1. **케이블 연결** 확인 (TX ↔ RX 교차)
2. **보드레이트** 일치 확인
3. **GND 공통 연결** 확인
4. **흐름 제어** 설정 확인

### GUI 실행 오류
```
ImportError: libGL.so.1: cannot open shared object file
```
**해결**: GUI 라이브러리 설치
```bash
# Ubuntu/Debian
sudo apt-get install libgl1-mesa-glx

# CentOS/RHEL
sudo yum install mesa-libGL
```

## 고급 기능

### 1. 사용자 정의 명령 추가
`mcu_serial_app.py`의 `quick_commands` 리스트를 수정하여 자주 사용하는 명령을 추가할 수 있습니다.

### 2. 로그 파일 저장
수신된 데이터를 파일로 저장하는 기능을 추가할 수 있습니다.

### 3. 자동 응답
특정 패턴의 데이터 수신 시 자동으로 응답하는 기능을 구현할 수 있습니다.

## 개발 정보

- **언어**: Python 3.7+
- **GUI 프레임워크**: PySide6 (Qt6)
- **시리얼 통신**: pyserial
- **멀티스레딩**: 안정적인 비동기 통신
- **크로스 플랫폼**: Windows, Linux, macOS 지원

## 라이선스

이 프로그램은 교육 및 개발 목적으로 자유롭게 사용할 수 있습니다.

---

**개발자 노트**: MCU와의 안정적인 통신을 위해 충분한 테스트를 권장합니다. 실제 하드웨어 연결 전에 가상 포트로 먼저 테스트해보세요.