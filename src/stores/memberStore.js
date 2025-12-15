// src/stores/memberStore.js
import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useMemberStore = defineStore('memberStore', () => {
    // 1. 상태(State): 로그인한 유저 정보
    const userInfo = ref(null);

    // 2. 기능(Action): 로그인 성공 시 정보 저장
    const setLoginUser = (user) => {
        userInfo.value = user;
    };

    // 3. 기능(Action): 로그아웃 시 정보 삭제
    const clearLoginUser = () => {
        userInfo.value = null;
    };

    return { userInfo, setLoginUser, clearLoginUser };
});