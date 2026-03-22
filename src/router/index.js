import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Hub',
        component: () => import('../views/Hub.vue')
    },

    // Phase I · 映 · 幽镜初明
    {
        path: '/phase1/dream-layer',
        name: 'DreamLayer',
        component: () => import('../views/simulators/phase1/DreamLayer/index.vue')
    },
    {
        path: '/phase1/echo-city',
        name: 'EchoCity',
        component: () => import('../views/simulators/phase1/EchoCity/index.vue')
    },
    {
        path: '/phase1/synesthesia',
        name: 'Synesthesia',
        component: () => import('../views/simulators/phase1/Synesthesia/index.vue')
    },
    {
        path: '/phase1/unsent',
        name: 'Unsent',
        component: () => import('../views/simulators/phase1/Unsent/index.vue')
    },

    // Phase II · 闻（待定）
    {
        path: '/phase2/letter-writer',
        name: 'LetterWriter',
        component: () => import('../views/simulators/phase2/LetterWriter/index.vue')
    },
    {
        path: '/phase2/listener',
        name: 'Listener',
        component: () => import('../views/simulators/phase2/Listener/index.vue')
    },
    // 07 08 待定，坑位先留着

    // Phase III · 知（待定）
    {
        path: '/phase3/digital-estate',
        name: 'DigitalEstate',
        component: () => import('../views/simulators/phase3/DigitalEstate/index.vue')
    },
    {
        path: '/phase3/ai-day-one',
        name: 'AiDayOne',
        component: () => import('../views/simulators/phase3/AiDayOne/index.vue')
    },
    {
        path: '/phase3/last-witness',
        name: 'LastWitness',
        component: () => import('../views/simulators/phase3/LastWitness/index.vue')
    },

    // Phase IV · 敬（待定）
    {
        path: '/phase4/crumbling-language',
        name: 'CrumblingLanguage',
        component: () => import('../views/simulators/phase4/CrumblingLanguage/index.vue')
    },
    {
        path: '/phase4/grey-scales',
        name: 'GreyScales',
        component: () => import('../views/simulators/phase4/GreyScales/index.vue')
    },
    {
        path: '/phase4/last-archive',
        name: 'LastArchive',
        component: () => import('../views/simulators/phase4/LastArchive/index.vue')
    },
]

export const router = createRouter({
    history: createWebHashHistory(),
    routes
})
