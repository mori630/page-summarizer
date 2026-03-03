const API_KEY = ""; 

document.getElementById('extractBtn').addEventListener('click', async () => {
  const resultArea = document.getElementById('resultArea');
  const loadingArea = document.getElementById('loadingArea');
  const statusText = document.getElementById('statusText');
  const extractBtn = document.getElementById('extractBtn');

  // UIを「読み込み中」の状態にする
  resultArea.style.opacity = "0.5"; 	// 結果エリアを少し薄く
  loadingArea.style.display = "block";
  statusText.style.display = "block";
  extractBtn.disabled = true; 	    	// 連打防止
  extractBtn.innerText = "要約中...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const scriptResult = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText 
    });

    const bodyText = scriptResult[0].result.replace(/\s+/g, ' ').substring(0, 1500);
    const prompt = `以下の内容を、3つの要約ポイントで箇条書きHTML形式(<ul><li>)でまとめてください。重要な部分は<strong>タグで囲んで。内容：${bodyText}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    if (data.candidates && data.candidates[0].content) {
      let aiResponse = data.candidates[0].content.parts[0].text;
      resultArea.innerHTML = aiResponse.replace(/```html|```/g, '').trim();
    }

  } catch (error) {
    resultArea.innerHTML = "エラーが発生しました: " + error.message;
  } finally {
    // 成功しても失敗しても、ローディングを止める
    loadingArea.style.display = "none";
    resultArea.style.opacity = "1.0";
    extractBtn.disabled = false;
    extractBtn.innerText = "内容を取得・要約";
  }
});