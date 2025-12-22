<template>
    <div class="admin-container">
      <h1>유저 관리 시스템</h1>
  
      <div class="dashboard">
        <div class="card">
          <p>총 가입자 수</p>
          <h3>{{ users.length }}명</h3>
        </div>
        <div class="card">
          <p>신규 가입자(오늘)</p>
          <h3>{{ newUsersCount }}명</h3>
        </div>
        <div class="card admin-card">
          <p>관리자 수</p>
          <h3>{{ adminsCount }}명</h3>
        </div>
      </div>
  
      <table class="user-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>아이디</th>
            <th>닉네임</th>
            <th>이메일</th>
            <th>가입일</th>
            <th>권한</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.userId">
            <td>{{ user.mno }}</td>
            <td>{{ user.userId }}</td>
            <td>{{ user.nickName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.createdAt?.substring(0, 10) }}</td>
            <td>
              <span :class="user.role === 1 ? 'badge-admin' : 'badge-user'">
                {{ user.role === 1 ? '관리자' : '일반' }}
              </span>
            </td>
            <td>
              <button 
                v-if="user.userId !== userInfo.userId"
                class="kick-btn" 
                @click="kickUser(user.userId)"
              >
                강제 탈퇴
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import { useMemberStore } from "@/stores/memberStore";
  import { storeToRefs } from "pinia";
  import axios from 'axios';
  
  const memberStore = useMemberStore();
  const { userInfo } = storeToRefs(memberStore);
  const users = ref([]);
  
  /* 데이터 조회 */
  const fetchUsers = async () => {
    try {
      const { data } = await axios.get('http://localhost:8080/admin/user', { withCredentials: true });
      users.value = data;
    } catch (e) {
      console.error("유저 목록 로드 실패", e);
    }
  };
  
  /* 요약 정보 계산 */
  const adminsCount = computed(() => users.value.filter(u => u.role === 1).length);
  const newUsersCount = computed(() => {
    const today = new Date().toISOString().substring(0, 10);
    return users.value.filter(u => u.createdAt?.startsWith(today)).length;
  });
  
  /* 강제 탈퇴 처리 */
  const kickUser = async (userId) => {
    if (!confirm(`${userId} 유저를 강제 탈퇴시키겠습니까?`)) return;
    try {
      await axios.delete(`http://localhost:8080/admin/user/${userId}`, { withCredentials: true });
      alert("처리되었습니다.");
      await fetchUsers(); // 목록 새로고침
    } catch (e) {
      alert("처리 중 오류가 발생했습니다.");
    }
  };
  
  onMounted(fetchUsers);
  </script>
  
  <style scoped>
  .admin-container { max-width: 1000px; margin: 80px auto; padding: 20px; }
  .dashboard { display: flex; gap: 20px; margin-bottom: 30px; }
  .card { flex: 1; padding: 20px; background: #f8f9fa; border-radius: 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
  .admin-card { background: #fff5f5; color: #e03131; }
  .user-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
  .user-table th, .user-table td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
  .badge-admin { background: #e03131; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  .badge-user { background: #dee2e6; color: #495057; padding: 2px 6px; border-radius: 4px; font-size: 12px; }
  .kick-btn { background: #ff4d4f; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
  .kick-btn:hover { background: #d9363e; }
  </style>