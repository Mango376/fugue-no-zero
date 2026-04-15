<template>
    <div class="placeholder">
      <p>待解锁</p>
      <button @click="$router.push('/')">返回主界面</button>
    </div>
  </template>
  
  <style scoped>
  .placeholder {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    background: #0a0e1a;
    color: #f5e6c8;
    font-family: 'KaiTi', serif;
    font-size: 1.5rem;
  }
  button {
    padding: 0.5rem 1.5rem;
    border: 1px solid #f5e6c8;
    background: transparent;
    color: #f5e6c8;
    cursor: pointer;
    font-family: 'KaiTi', serif;
    font-size: 1rem;
  }
  button:hover {
    background: rgba(245, 230, 200, 0.1);
  }
  </style>
  