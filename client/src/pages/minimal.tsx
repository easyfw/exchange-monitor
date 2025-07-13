import { useState, useEffect, useCallback } from "react";

export default function Minimal() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(30);

  console.log("Minimal component rendering"); // 디버깅용

  const fetchData = useCallback(async () => {
    try {
      // 환율 데이터 가져오기
      const ratesResponse = await fetch('/api/rates');
      const ratesData = await ratesResponse.json();
      setRates(ratesData);

      // 설정 가져오기 (초기 로드에서만)
      if (loading) {
        const showLogsResponse = await fetch('/api/settings/showLogs');
        if (showLogsResponse.ok) {
          const showLogsData = await showLogsResponse.json();
          setShowLogs(showLogsData.value === 'true');
        }

        const updateIntervalResponse = await fetch('/api/settings/updateInterval');
        if (updateIntervalResponse.ok) {
          const intervalData = await updateIntervalResponse.json();
          setUpdateInterval(parseInt(intervalData.value));
        }
      }

      // 발동된 알림 체크 (로그용)
      const alertCheckResponse = await fetch('/api/alerts/check');
      if (alertCheckResponse.ok) {
        const triggeredAlerts = await alertCheckResponse.json();
        
        if (triggeredAlerts.length > 0) {
          setLogs(prevLogs => [
            ...triggeredAlerts.map((alert: any) => ({
              timestamp: alert.timestamp,
              message: `🚨 ${alert.alert.currencyPair} ${alert.alert.targetType === 'above' ? '상승' : '하락'} 알림: ${alert.targetRate}원 (현재: ${alert.currentRate}원)`,
              type: 'alert'
            })),
            ...prevLogs.slice(0, 49) // 최대 50개 유지
          ]);
        }
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 업데이트 간격이 변경될 때마다 타이머 재설정
  useEffect(() => {
    const interval = setInterval(fetchData, updateInterval * 1000);
    return () => clearInterval(interval);
  }, [updateInterval]);

  const toggleLogs = async () => {
    const newShowLogs = !showLogs;
    setShowLogs(newShowLogs);
    
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'showLogs',
          value: newShowLogs.toString()
        })
      });
    } catch (error) {
      console.error('Failed to save log setting:', error);
    }
  };

  const handleUpdateIntervalChange = async (newInterval: number) => {
    setUpdateInterval(newInterval);
    
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'updateInterval',
          value: newInterval.toString()
        })
      });
    } catch (error) {
      console.error('Failed to save interval setting:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px' 
      }}>
        <h1 style={{ margin: 0, color: '#333' }}>환율 모니터</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={toggleLogs}
            style={{
              padding: '10px 20px',
              backgroundColor: showLogs ? '#28a745' : '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            📋 로그 {showLogs ? '숨김' : '표시'}
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            ⚙️ 설정
          </button>
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        {rates.map((rate, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>
              {rate.currencyPair}
            </h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
              {rate.rate}{rate.currencyPair.includes('KRW') ? '원' : ''}
            </div>
            <div style={{ 
              fontSize: '14px',
              color: parseFloat(rate.change) >= 0 ? '#16a34a' : '#dc2626'
            }}>
              {parseFloat(rate.change) >= 0 ? '▲' : '▼'} {Math.abs(parseFloat(rate.change)).toFixed(4)} 
              ({parseFloat(rate.changePercent) >= 0 ? '+' : ''}{parseFloat(rate.changePercent).toFixed(2)}%)
            </div>
          </div>
        ))}
      </div>
      
      {/* 로그 창 */}
      {showLogs && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #dee2e6'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              📋 이벤트 로그
            </h3>
            <button
              onClick={() => setLogs([])}
              style={{
                padding: '5px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              로그 삭제
            </button>
          </div>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            border: '1px solid #e9ecef',
            borderRadius: '4px',
            padding: '10px'
          }}>
            {logs.length === 0 ? (
              <p style={{ 
                margin: 0, 
                color: '#6c757d', 
                fontStyle: 'italic',
                textAlign: 'center',
                padding: '20px'
              }}>
                아직 이벤트가 없습니다
              </p>
            ) : (
              logs.map((log, index) => (
                <div 
                  key={index}
                  style={{
                    padding: '8px 0',
                    borderBottom: index < logs.length - 1 ? '1px solid #f1f3f4' : 'none',
                    fontSize: '14px'
                  }}
                >
                  <span style={{ 
                    color: '#6c757d', 
                    fontSize: '12px',
                    marginRight: '10px'
                  }}>
                    {log.timestamp}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 설정 모달 */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            minWidth: '400px',
            maxWidth: '500px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>설정</h2>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            {/* 업데이트 간격 설정 */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px',
                fontWeight: '500'
              }}>
                업데이트 간격
              </label>
              <select
                value={updateInterval}
                onChange={(e) => handleUpdateIntervalChange(parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              >
                <option value={5}>5초</option>
                <option value={10}>10초</option>
                <option value={30}>30초</option>
                <option value={60}>1분</option>
                <option value={300}>5분</option>
                <option value={600}>10분</option>
              </select>
            </div>

            {/* 로그 표시 설정 */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={showLogs}
                  onChange={toggleLogs}
                  style={{ marginRight: '10px' }}
                />
                이벤트 로그 표시
              </label>
            </div>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end',
              gap: '10px'
            }}>
              <button
                onClick={() => setShowSettings(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
        {updateInterval}초마다 자동 업데이트
      </div>
    </div>
  );
}