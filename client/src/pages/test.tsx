export default function Test() {
  console.log("Test component rendering");
  
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
        <h1 style={{ margin: 0, color: '#333' }}>환율 모니터 - 테스트</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            📋 로그 표시
          </button>
          <button 
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            ⚙️ 설정
          </button>
        </div>
      </div>
      
      <p>이것은 테스트 페이지입니다. 설정 버튼이 보이나요?</p>
    </div>
  );
}