#!/usr/bin/env python3
"""
MCU RS232 통신 콘솔 프로그램
GUI 없이 기본 시리얼 통신 기능을 테스트하는 버전
"""

import serial
import serial.tools.list_ports
import threading
import time
import sys
from datetime import datetime


class MCUSerialConsole:
    def __init__(self):
        self.serial_port = None
        self.is_running = False
        self.read_thread = None
        
    def list_ports(self):
        """사용 가능한 시리얼 포트 목록 출력"""
        print("\n=== 사용 가능한 시리얼 포트 ===")
        ports = serial.tools.list_ports.comports()
        
        if not ports:
            print("사용 가능한 포트가 없습니다.")
            return []
            
        for i, port in enumerate(ports):
            print(f"{i+1}. {port.device} - {port.description}")
            
        return ports
    
    def connect(self, port, baudrate=115200, databits=8, stopbits=1, parity='N'):
        """시리얼 포트 연결"""
        try:
            if self.serial_port and self.serial_port.is_open:
                self.disconnect()
                
            # 패리티 변환
            parity_map = {'N': serial.PARITY_NONE, 'E': serial.PARITY_EVEN, 'O': serial.PARITY_ODD}
            
            self.serial_port = serial.Serial(
                port=port,
                baudrate=baudrate,
                bytesize=databits,
                stopbits=stopbits,
                parity=parity_map.get(parity, serial.PARITY_NONE),
                timeout=1,
                xonxoff=False,
                rtscts=False,
                dsrdtr=False
            )
            
            if self.serial_port.is_open:
                print(f"✅ 연결됨: {port} (보드레이트: {baudrate})")
                self.start_reading()
                return True
            else:
                print(f"❌ 연결 실패: {port}")
                return False
                
        except Exception as e:
            print(f"❌ 연결 오류: {e}")
            return False
    
    def disconnect(self):
        """시리얼 포트 연결 해제"""
        self.is_running = False
        
        if self.read_thread and self.read_thread.is_alive():
            self.read_thread.join(timeout=2)
            
        if self.serial_port and self.serial_port.is_open:
            self.serial_port.close()
            print("🔌 연결 해제됨")
    
    def start_reading(self):
        """데이터 읽기 스레드 시작"""
        self.is_running = True
        self.read_thread = threading.Thread(target=self._read_data, daemon=True)
        self.read_thread.start()
    
    def _read_data(self):
        """데이터 읽기 스레드 함수"""
        buffer = ""
        
        while self.is_running and self.serial_port and self.serial_port.is_open:
            try:
                if self.serial_port.in_waiting > 0:
                    data = self.serial_port.read(self.serial_port.in_waiting)
                    try:
                        decoded_data = data.decode('utf-8', errors='ignore')
                        buffer += decoded_data
                        
                        # 라인 단위로 처리
                        while '\n' in buffer:
                            line, buffer = buffer.split('\n', 1)
                            line = line.strip()
                            if line:
                                timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                                print(f"[{timestamp}] RX: {line}")
                                
                    except UnicodeDecodeError:
                        # 바이너리 데이터 처리
                        hex_data = ' '.join(f'{b:02X}' for b in data)
                        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                        print(f"[{timestamp}] RX (HEX): {hex_data}")
                        
                time.sleep(0.01)  # CPU 사용률 최적화
                
            except Exception as e:
                print(f"❌ 수신 오류: {e}")
                break
    
    def send_data(self, data, add_newline=True):
        """데이터 전송"""
        try:
            if not self.serial_port or not self.serial_port.is_open:
                print("❌ 포트가 연결되지 않았습니다.")
                return False
                
            if add_newline and not data.endswith('\n'):
                data += '\n'
                
            self.serial_port.write(data.encode('utf-8'))
            self.serial_port.flush()
            
            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
            print(f"[{timestamp}] TX: {repr(data)[1:-1]}")
            return True
            
        except Exception as e:
            print(f"❌ 전송 오류: {e}")
            return False
    
    def interactive_mode(self):
        """대화형 모드"""
        print("\n=== MCU RS232 통신 프로그램 ===")
        print("명령어:")
        print("  list    - 포트 목록 보기")
        print("  connect - 포트 연결")
        print("  send    - 데이터 전송")
        print("  quit    - 종료")
        print("  help    - 도움말")
        
        while True:
            try:
                command = input("\n> ").strip().lower()
                
                if command == 'quit' or command == 'exit':
                    break
                elif command == 'list':
                    self.list_ports()
                elif command == 'connect':
                    self._connect_interactive()
                elif command == 'send':
                    self._send_interactive()
                elif command == 'help':
                    self._show_help()
                elif command.startswith('send '):
                    # 빠른 전송: "send AT" 형식
                    data = command[5:]
                    self.send_data(data)
                elif command == '':
                    continue
                else:
                    print(f"알 수 없는 명령어: {command}")
                    
            except KeyboardInterrupt:
                print("\n종료 중...")
                break
            except EOFError:
                break
        
        self.disconnect()
        print("프로그램을 종료합니다.")
    
    def _connect_interactive(self):
        """대화형 연결"""
        ports = self.list_ports()
        if not ports:
            return
            
        try:
            choice = input("포트 번호를 선택하세요 (1-{}): ".format(len(ports)))
            port_index = int(choice) - 1
            
            if 0 <= port_index < len(ports):
                selected_port = ports[port_index].device
                
                # 보드레이트 선택
                baudrate = input("보드레이트 [115200]: ").strip()
                if not baudrate:
                    baudrate = "115200"
                    
                self.connect(selected_port, int(baudrate))
            else:
                print("잘못된 선택입니다.")
                
        except ValueError:
            print("올바른 숫자를 입력하세요.")
        except Exception as e:
            print(f"연결 오류: {e}")
    
    def _send_interactive(self):
        """대화형 전송"""
        if not self.serial_port or not self.serial_port.is_open:
            print("먼저 포트에 연결하세요.")
            return
            
        data = input("전송할 데이터: ")
        if data:
            self.send_data(data)
    
    def _show_help(self):
        """도움말 표시"""
        print("\n=== 도움말 ===")
        print("빠른 명령어:")
        print("  send AT        - AT 명령 전송")
        print("  send RST       - 리셋 명령 전송")
        print("  send STATUS    - 상태 확인")
        print("  send VER       - 버전 확인")
        print("\n일반 명령어:")
        print("  list           - 사용 가능한 포트 목록")
        print("  connect        - 시리얼 포트 연결")
        print("  send           - 데이터 전송 (대화형)")
        print("  quit/exit      - 프로그램 종료")


def main():
    console = MCUSerialConsole()
    
    # 명령행 인수 처리
    if len(sys.argv) > 1:
        if sys.argv[1] == '--list':
            console.list_ports()
            return
        elif sys.argv[1] == '--test':
            # 자동 테스트 모드
            ports = console.list_ports()
            if ports:
                print(f"\n테스트 연결: {ports[0].device}")
                if console.connect(ports[0].device):
                    print("5초 후 테스트 데이터 전송...")
                    time.sleep(5)
                    console.send_data("AT")
                    time.sleep(2)
                    console.send_data("STATUS")
                    time.sleep(3)
                console.disconnect()
            return
    
    # 대화형 모드
    console.interactive_mode()


if __name__ == "__main__":
    main()