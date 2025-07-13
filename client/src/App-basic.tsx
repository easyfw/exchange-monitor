export default function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>환율 모니터 - 기본 버전</h1>
      <p>React 앱이 정상 작동합니다!</p>
      <div style={{ marginTop: '20px' }}>
        <div style={{ 
          backgroundColor: '#f0f8ff', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <h3>USD/KRW</h3>
          <div>1354원</div>
        </div>
        <div style={{ 
          backgroundColor: '#fff8f0', 
          padding: '15px', 
          borderRadius: '8px',
          marginBottom: '10px'
        }}>
          <h3>JPY/KRW</h3>
          <div>9.47원</div>  
        </div>
        <div style={{ 
          backgroundColor: '#f0fff0', 
          padding: '15px', 
          borderRadius: '8px'
        }}>
          <h3>USD/JPY</h3>
          <div>142.95</div>
        </div>
      </div>
    </div>
  );
}