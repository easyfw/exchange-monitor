#!/usr/bin/env python3
"""
MCU RS232 통신 애플리케이션
PySide6와 pyserial을 사용한 안정적인 시리얼 통신 프로그램
"""

import sys
import serial
import serial.tools.list_ports
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QVBoxLayout, QHBoxLayout, 
    QWidget, QComboBox, QPushButton, QTextEdit, QLineEdit,
    QLabel, QGroupBox, QSpinBox, QCheckBox, QStatusBar,
    QSplitter, QMessageBox, QGridLayout
)
from PySide6.QtCore import QTimer, QThread, Signal, QMutex
from PySide6.QtGui import QFont, QTextCursor, QColor, QPalette
import time
import threading
from datetime import datetime


class SerialWorker(QThread):
    """시리얼 통신을 처리하는 별도 스레드"""
    data_received = Signal(str)
    connection_status = Signal(bool, str)
    
    def __init__(self):
        super().__init__()
        self.serial_port = None
        self.is_running = False
        self.mutex = QMutex()
        
    def connect_serial(self, port, baudrate, databits, stopbits, parity):
        """시리얼 포트 연결"""
        try:
            if self.serial_port and self.serial_port.is_open:
                self.serial_port.close()
                
            self.serial_port = serial.Serial(
                port=port,
                baudrate=baudrate,
                bytesize=databits,
                stopbits=stopbits,
                parity=parity,
                timeout=1,
                xonxoff=False,
                rtscts=False,
                dsrdtr=False
            )
            
            if self.serial_port.is_open:
                self.connection_status.emit(True, f"연결됨: {port}")
                return True
            else:
                self.connection_status.emit(False, "연결 실패")
                return False
                
        except Exception as e:
            self.connection_status.emit(False, f"연결 오류: {str(e)}")
            return False
    
    def disconnect_serial(self):
        """시리얼 포트 연결 해제"""
        try:
            if self.serial_port and self.serial_port.is_open:
                self.serial_port.close()
            self.connection_status.emit(False, "연결 해제됨")
        except Exception as e:
            self.connection_status.emit(False, f"해제 오류: {str(e)}")
    
    def send_data(self, data):
        """데이터 전송"""
        try:
            if self.serial_port and self.serial_port.is_open:
                self.serial_port.write(data.encode('utf-8'))
                self.serial_port.flush()
                return True
        except Exception as e:
            self.connection_status.emit(False, f"전송 오류: {str(e)}")
            return False
    
    def run(self):
        """스레드 실행 - 데이터 수신 대기"""
        self.is_running = True
        buffer = ""
        
        while self.is_running:
            try:
                if self.serial_port and self.serial_port.is_open:
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
                                    self.data_received.emit(f"[{timestamp}] RX: {line}")
                        except UnicodeDecodeError:
                            # 바이너리 데이터 처리
                            hex_data = ' '.join(f'{b:02X}' for b in data)
                            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
                            self.data_received.emit(f"[{timestamp}] RX (HEX): {hex_data}")
                            
                    self.msleep(10)  # CPU 사용률 최적화
                else:
                    self.msleep(100)
                    
            except Exception as e:
                self.connection_status.emit(False, f"수신 오류: {str(e)}")
                self.msleep(1000)
    
    def stop(self):
        """스레드 중지"""
        self.is_running = False
        self.disconnect_serial()
        self.quit()
        self.wait()


class MCUSerialApp(QMainWindow):
    """메인 애플리케이션 클래스"""
    
    def __init__(self):
        super().__init__()
        self.serial_worker = SerialWorker()
        self.init_ui()
        self.setup_connections()
        self.refresh_ports()
        
    def init_ui(self):
        """UI 초기화"""
        self.setWindowTitle("MCU RS232 통신 프로그램")
        self.setGeometry(100, 100, 900, 700)
        
        # 중앙 위젯
        central_widget = QWidget()
        self.setCentralWidget(central_widget)
        
        # 메인 레이아웃
        main_layout = QVBoxLayout(central_widget)
        
        # 연결 설정 그룹
        self.create_connection_group()
        main_layout.addWidget(self.connection_group)
        
        # 스플리터로 상하 분할
        splitter = QSplitter()
        main_layout.addWidget(splitter)
        
        # 데이터 표시 영역
        self.create_data_display()
        splitter.addWidget(self.data_display_group)
        
        # 데이터 전송 영역
        self.create_send_group()
        splitter.addWidget(self.send_group)
        
        # 상태바
        self.status_bar = QStatusBar()
        self.setStatusBar(self.status_bar)
        self.status_bar.showMessage("준비")
        
        # 스타일 설정
        self.setup_styles()
        
    def create_connection_group(self):
        """연결 설정 UI 생성"""
        self.connection_group = QGroupBox("시리얼 포트 설정")
        layout = QGridLayout()
        
        # 포트 선택
        layout.addWidget(QLabel("포트:"), 0, 0)
        self.port_combo = QComboBox()
        self.port_combo.setMinimumWidth(120)
        layout.addWidget(self.port_combo, 0, 1)
        
        self.refresh_button = QPushButton("새로고침")
        self.refresh_button.clicked.connect(self.refresh_ports)
        layout.addWidget(self.refresh_button, 0, 2)
        
        # 보드레이트
        layout.addWidget(QLabel("보드레이트:"), 0, 3)
        self.baudrate_combo = QComboBox()
        self.baudrate_combo.addItems(['9600', '19200', '38400', '57600', '115200', '230400'])
        self.baudrate_combo.setCurrentText('115200')
        layout.addWidget(self.baudrate_combo, 0, 4)
        
        # 데이터 비트
        layout.addWidget(QLabel("데이터 비트:"), 1, 0)
        self.databits_combo = QComboBox()
        self.databits_combo.addItems(['7', '8'])
        self.databits_combo.setCurrentText('8')
        layout.addWidget(self.databits_combo, 1, 1)
        
        # 정지 비트
        layout.addWidget(QLabel("정지 비트:"), 1, 2)
        self.stopbits_combo = QComboBox()
        self.stopbits_combo.addItems(['1', '2'])
        layout.addWidget(self.stopbits_combo, 1, 3)
        
        # 패리티
        layout.addWidget(QLabel("패리티:"), 1, 4)
        self.parity_combo = QComboBox()
        self.parity_combo.addItems(['None', 'Even', 'Odd'])
        layout.addWidget(self.parity_combo, 1, 5)
        
        # 연결/해제 버튼
        self.connect_button = QPushButton("연결")
        self.connect_button.clicked.connect(self.toggle_connection)
        layout.addWidget(self.connect_button, 0, 5)
        
        self.connection_group.setLayout(layout)
        
    def create_data_display(self):
        """데이터 표시 영역 생성"""
        self.data_display_group = QGroupBox("수신 데이터")
        layout = QVBoxLayout()
        
        # 제어 버튼들
        control_layout = QHBoxLayout()
        
        self.auto_scroll_check = QCheckBox("자동 스크롤")
        self.auto_scroll_check.setChecked(True)
        control_layout.addWidget(self.auto_scroll_check)
        
        self.show_timestamp_check = QCheckBox("타임스탬프 표시")
        self.show_timestamp_check.setChecked(True)
        control_layout.addWidget(self.show_timestamp_check)
        
        clear_button = QPushButton("지우기")
        clear_button.clicked.connect(self.clear_received_data)
        control_layout.addWidget(clear_button)
        
        control_layout.addStretch()
        layout.addLayout(control_layout)
        
        # 수신 데이터 표시 영역
        self.received_text = QTextEdit()
        self.received_text.setReadOnly(True)
        self.received_text.setMinimumHeight(200)
        layout.addWidget(self.received_text)
        
        self.data_display_group.setLayout(layout)
        
    def create_send_group(self):
        """데이터 전송 영역 생성"""
        self.send_group = QGroupBox("데이터 전송")
        layout = QVBoxLayout()
        
        # 전송 옵션
        options_layout = QHBoxLayout()
        
        self.hex_mode_check = QCheckBox("HEX 모드")
        options_layout.addWidget(self.hex_mode_check)
        
        self.add_newline_check = QCheckBox("개행 문자 추가")
        self.add_newline_check.setChecked(True)
        options_layout.addWidget(self.add_newline_check)
        
        self.add_carriage_return_check = QCheckBox("CR 추가")
        options_layout.addWidget(self.add_carriage_return_check)
        
        options_layout.addStretch()
        layout.addLayout(options_layout)
        
        # 전송 입력 영역
        send_layout = QHBoxLayout()
        
        self.send_line = QLineEdit()
        self.send_line.setPlaceholderText("전송할 데이터를 입력하세요...")
        self.send_line.returnPressed.connect(self.send_data)
        send_layout.addWidget(self.send_line)
        
        self.send_button = QPushButton("전송")
        self.send_button.clicked.connect(self.send_data)
        self.send_button.setEnabled(False)
        send_layout.addWidget(self.send_button)
        
        layout.addLayout(send_layout)
        
        # 빠른 전송 버튼들
        quick_layout = QGridLayout()
        quick_commands = [
            ("AT", "AT"),
            ("리셋", "RST"),
            ("상태", "STATUS"),
            ("버전", "VER"),
            ("도움말", "HELP"),
            ("사용자 정의", "")
        ]
        
        for i, (label, command) in enumerate(quick_commands):
            button = QPushButton(label)
            button.clicked.connect(lambda checked, cmd=command: self.send_quick_command(cmd))
            quick_layout.addWidget(button, i // 3, i % 3)
        
        layout.addLayout(quick_layout)
        
        self.send_group.setLayout(layout)
        
    def setup_styles(self):
        """스타일 설정"""
        # 폰트 설정
        font = QFont("Consolas", 9)
        self.received_text.setFont(font)
        self.send_line.setFont(font)
        
        # 색상 테마
        palette = self.received_text.palette()
        palette.setColor(QPalette.Base, QColor("#1e1e1e"))
        palette.setColor(QPalette.Text, QColor("#ffffff"))
        self.received_text.setPalette(palette)
        
    def setup_connections(self):
        """시그널-슬롯 연결"""
        self.serial_worker.data_received.connect(self.on_data_received)
        self.serial_worker.connection_status.connect(self.on_connection_status)
        
    def refresh_ports(self):
        """시리얼 포트 목록 새로고침"""
        self.port_combo.clear()
        ports = serial.tools.list_ports.comports()
        
        for port in ports:
            port_info = f"{port.device}"
            if port.description != "n/a":
                port_info += f" - {port.description}"
            self.port_combo.addItem(port_info, port.device)
            
        if not ports:
            self.port_combo.addItem("포트를 찾을 수 없음", "")
            
    def toggle_connection(self):
        """연결/해제 토글"""
        if self.connect_button.text() == "연결":
            self.connect_serial()
        else:
            self.disconnect_serial()
            
    def connect_serial(self):
        """시리얼 포트 연결"""
        if self.port_combo.count() == 0 or not self.port_combo.currentData():
            QMessageBox.warning(self, "경고", "유효한 포트를 선택하세요.")
            return
            
        port = self.port_combo.currentData()
        baudrate = int(self.baudrate_combo.currentText())
        
        # 데이터 비트 변환
        databits_map = {'7': serial.SEVENBITS, '8': serial.EIGHTBITS}
        databits = databits_map[self.databits_combo.currentText()]
        
        # 정지 비트 변환
        stopbits_map = {'1': serial.STOPBITS_ONE, '2': serial.STOPBITS_TWO}
        stopbits = stopbits_map[self.stopbits_combo.currentText()]
        
        # 패리티 변환
        parity_map = {'None': serial.PARITY_NONE, 'Even': serial.PARITY_EVEN, 'Odd': serial.PARITY_ODD}
        parity = parity_map[self.parity_combo.currentText()]
        
        if self.serial_worker.connect_serial(port, baudrate, databits, stopbits, parity):
            self.serial_worker.start()
            
    def disconnect_serial(self):
        """시리얼 포트 연결 해제"""
        self.serial_worker.stop()
        
    def on_connection_status(self, connected, message):
        """연결 상태 변경 처리"""
        if connected:
            self.connect_button.setText("해제")
            self.connect_button.setStyleSheet("background-color: #ff4444")
            self.send_button.setEnabled(True)
            
            # 연결 설정 비활성화
            self.port_combo.setEnabled(False)
            self.baudrate_combo.setEnabled(False)
            self.databits_combo.setEnabled(False)
            self.stopbits_combo.setEnabled(False)
            self.parity_combo.setEnabled(False)
            self.refresh_button.setEnabled(False)
        else:
            self.connect_button.setText("연결")
            self.connect_button.setStyleSheet("background-color: #44aa44")
            self.send_button.setEnabled(False)
            
            # 연결 설정 활성화
            self.port_combo.setEnabled(True)
            self.baudrate_combo.setEnabled(True)
            self.databits_combo.setEnabled(True)
            self.stopbits_combo.setEnabled(True)
            self.parity_combo.setEnabled(True)
            self.refresh_button.setEnabled(True)
            
        self.status_bar.showMessage(message)
        
    def on_data_received(self, data):
        """데이터 수신 처리"""
        cursor = self.received_text.textCursor()
        cursor.movePosition(QTextCursor.End)
        cursor.insertText(data + "\n")
        
        if self.auto_scroll_check.isChecked():
            self.received_text.ensureCursorVisible()
            
    def send_data(self):
        """데이터 전송"""
        data = self.send_line.text()
        if not data:
            return
            
        if self.hex_mode_check.isChecked():
            try:
                # HEX 모드: 스페이스로 구분된 16진수 문자열을 바이트로 변환
                hex_values = data.replace(' ', '')
                if len(hex_values) % 2 != 0:
                    hex_values = '0' + hex_values
                data = bytes.fromhex(hex_values).decode('latin-1')
            except ValueError:
                QMessageBox.warning(self, "오류", "유효하지 않은 HEX 데이터입니다.")
                return
        else:
            # 개행 문자 추가
            if self.add_carriage_return_check.isChecked():
                data += "\r"
            if self.add_newline_check.isChecked():
                data += "\n"
                
        if self.serial_worker.send_data(data):
            timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
            tx_data = repr(data)[1:-1]  # 문자열 표현에서 따옴표 제거
            self.received_text.append(f"[{timestamp}] TX: {tx_data}")
            self.send_line.clear()
            
    def send_quick_command(self, command):
        """빠른 명령 전송"""
        if command:
            self.send_line.setText(command)
            self.send_data()
        else:
            # 사용자 정의 명령
            text, ok = QLineEdit().text(), True  # 간단화된 입력
            if ok and text:
                self.send_line.setText(text)
                self.send_data()
                
    def clear_received_data(self):
        """수신 데이터 지우기"""
        self.received_text.clear()
        
    def closeEvent(self, event):
        """프로그램 종료 시 정리"""
        self.serial_worker.stop()
        event.accept()


def main():
    app = QApplication(sys.argv)
    app.setStyle('Fusion')  # 모던한 스타일
    
    window = MCUSerialApp()
    window.show()
    
    sys.exit(app.exec())


if __name__ == "__main__":
    main()