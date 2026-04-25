// Background Service Worker - 后台服务

// 安装时初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('JobFit 插件已安装');
});

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchJobInfo') {
    // 转发给content script获取职位信息
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('zhipin.com')) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'getJobInfo' }, (response) => {
          sendResponse(response);
        });
      } else {
        sendResponse({ error: '当前页面不是BOSS直聘' });
      }
    });
    return true;
  }
});

// 监听标签页更新，可以在这里做缓存清理等操作
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    console.log('JobFit: 页面更新', tab.url);
  }
});
