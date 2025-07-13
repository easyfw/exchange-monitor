import { useState, useEffect } from "react";
import { Bell, Settings } from "lucide-react";

export default function App() {
  const [rates, setRates] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [updateInterval, setUpdateInterval] = useState(30);
  const [showLogs, setShowLogs] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [newAlert, setNewAlert] = useState({
    currencyPair: 'USD/KRW',
    alertType: 'above',
    targetRate: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ratesResponse = await fetch('/api/rates');
        const ratesData = await ratesResponse.json();
        setRates(ratesData);

        const alertsResponse = await fetch('/api/alerts');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);

        const updateIntervalResponse = await fetch('/api/settings/updateInterval');
        if (updateIntervalResponse.ok) {
          const intervalData = await updateIntervalResponse.json();
          setUpdateInterval(parseInt(intervalData.value));
        }

        const showLogsResponse = await fetch('/api/settings/showLogs');
        if (showLogsResponse.ok) {
          const showLogsData = await showLogsResponse.json();
          setShowLogs(showLogsData.value === 'true');
        }

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
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAlert.targetRate || isNaN(parseFloat(newAlert.targetRate))) {
      alert('올바른 목표 환율을 입력해주세요');
      return;
    }

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currencyPair: newAlert.currencyPair,
          targetType: newAlert.alertType,
          targetRate: parseFloat(newAlert.targetRate),
          isActive: true
        })
      });

      if (response.ok) {
        const alertsResponse = await fetch('/api/alerts');
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData);
        
        setShowAlertForm(false);
        setNewAlert({ currencyPair: 'USD/KRW', alertType: 'above', targetRate: '' });
        alert('알림이 생성되었습니다!');
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
      alert('알림 생성에 실패했습니다');
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setAlerts(alerts.filter(alert => alert.id !== id));
        alert('알림이 삭제되었습니다');
      }
    } catch (error) {
      console.error('Failed to delete alert:', error);
      alert('알림 삭제에 실패했습니다');
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

  const handleToggleLogs = async () => {
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
      console.error('Failed to save logs setting:', error);
    }
  };

  const sortedRates = rates.sort((a, b) => {
    const order = ['USD/KRW', 'JPY/KRW', 'USD/JPY'];
    return order.indexOf(a.currencyPair) - order.indexOf(b.currencyPair);
  });

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        환율 데이터를 불러오는 중...
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
      {/* 헤더 */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div>
          <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#333' }}>
            환율 모니터
          </h1>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            실시간 환율 추적 및 알림
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setShowAlertForm(!showAlertForm)}
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
            <Bell size={16} />
            알림 추가
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Settings size={16} />
            설정
          </button>
        </div>
      </div>

      {/* 환율 카드들 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {sortedRates.map((rate, index) => (
          <div key={index} style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', color: '#333' }}>
              {rate.currencyPair}
            </h3>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#333' }}>
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

      {/* 알림 추가 폼 */}
      {showAlertForm && (
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 15px 0' }}>새 알림 추가</h3>
          <form onSubmit={handleCreateAlert}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                통화쌍
              </label>
              <select 
                value={newAlert.currencyPair}
                onChange={(e) => setNewAlert({...newAlert, currencyPair: e.target.value})}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                <option value="USD/KRW">USD/KRW</option>
                <option value="JPY/KRW">JPY/KRW</option>
                <option value="USD/JPY">USD/JPY</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                알림 유형
              </label>
              <div style={{ display: 'flex', gap: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="radio" 
                    name="alertType" 
                    value="above"
                    checked={newAlert.alertType === 'above'}
                    onChange={(e) => setNewAlert({...newAlert, alertType: e.target.value as 'above' | 'below'})}
                  />
                  이상
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <input 
                    type="radio" 
                    name="alertType" 
                    value="below"
                    checked={newAlert.alertType === 'below'}
                    onChange={(e) => setNewAlert({...newAlert, alertType: e.target.value as 'above' | 'below'})}
                  />
                  이하
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                목표 환율
              </label>
              <input 
                type="number"
                step="any"
                value={newAlert.targetRate}
                onChange={(e) => setNewAlert({...newAlert, targetRate: e.target.value})}
                placeholder="예: 1350"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="submit"
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                알림 생성
              </button>
              <button 
                type="button"
                onClick={() => setShowAlertForm(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                취소
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 활성 알림 목록 */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0' }}>활성 알림 ({alerts.length}개)</h3>
        
        {alerts.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>설정된 알림이 없습니다.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {alerts.map((alert) => (
              <div key={alert.id} style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong>{alert.currencyPair}</strong> {alert.targetType === 'above' ? '이상' : '이하'} {alert.targetRate}
                  {alert.currencyPair.includes('KRW') ? '원' : ''}
                  {alert.isActive ? 
                    <span style={{ color: '#28a745', marginLeft: '10px' }}>(활성)</span> : 
                    <span style={{ color: '#6c757d', marginLeft: '10px' }}>(비활성)</span>
                  }
                </div>
                <button 
                  onClick={() => handleDeleteAlert(alert.id)}
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
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
              <h2 style={{ margin: 0, fontSize: '20px' }}>설정 NEW</h2>
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
                cursor: 'pointer',
                fontWeight: '500'
              }}>
                <input
                  type="checkbox"
                  checked={showLogs}
                  onChange={handleToggleLogs}
                  style={{
                    marginRight: '10px',
                    width: '16px',
                    height: '16px'
                  }}
                />
                로그 표시
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
                  <span style={{ color: '#666', fontSize: '12px', marginRight: '10px' }}>
                    {log.timestamp}
                  </span>
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '12px', color: '#666', textAlign: 'center' }}>
        {updateInterval}초마다 자동 업데이트 | 알림 시스템 활성화됨 | 로그: {showLogs ? '표시' : '숨김'}
      </div>
    </div>
  );
}