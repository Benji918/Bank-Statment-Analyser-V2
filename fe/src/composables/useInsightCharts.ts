import { storeToRefs } from 'pinia'
import { computed } from 'vue'
import type { ECBasicOption } from 'echarts/types/dist/shared'
import type { InsightData } from '@/types/insight.types'
import { useUiStore } from '@/stores/ui.store'

export function useInsightCharts(data: InsightData, forcedTheme?: 'light' | 'dark') {
    const uiStore = useUiStore()
    const { theme } = storeToRefs(uiStore)
    
    // We check forcedTheme first so we can lock the charts to light mode for PDF prints
    const currentTheme = computed(() => forcedTheme || theme.value)
    
    function getTextColor() {
        return currentTheme.value === 'dark' ? '#9CA3AF' : '#64748B'
    }

    function getGridLineColor() {
        return currentTheme.value === 'dark' ? '#1F2937' : '#E2E8F0'
    }
    
    const commonTextStyle = { fontFamily: 'Outfit, sans-serif' }
    const modernTooltip = {
        backgroundColor: currentTheme.value === 'dark' ? 'rgba(10, 10, 10, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        borderColor: currentTheme.value === 'dark' ? '#222' : '#E2E8F0',
        textStyle: { ...commonTextStyle, color: currentTheme.value === 'dark' ? '#fff' : '#000' },
        borderRadius: 12,
        padding: [12, 16],
        shadowColor: 'rgba(0, 0, 0, 0.2)',
        shadowBlur: 10,
    }

    function getSpendingByCategoryOption() {
        const entries = Object.entries(data.spending_by_category)
        return {
            textStyle: commonTextStyle,
            tooltip: { ...modernTooltip, trigger: 'item', formatter: '{b}: £{c} ({d}%)' },
            legend: { 
                orient: 'vertical', 
                left: 'left', 
                top: 'middle',
                textStyle: { ...commonTextStyle, color: getTextColor() },
                itemWidth: 10,
                itemHeight: 10,
                icon: 'circle'
            },
            color: ['#0099FF', '#0000EE', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'],
            series: [
                {
                    name: 'Spending',
                    type: 'pie',
                    radius: ['55%', '85%'],
                    center: ['65%', '50%'],
                    avoidLabelOverlap: false,
                    itemStyle: { 
                        borderRadius: 8, 
                        borderColor: currentTheme.value === 'dark' ? '#0a0a0a' : '#ffffff', 
                        borderWidth: 3 
                    },
                    label: { show: false },
                    emphasis: { 
                        label: { show: true, fontSize: 18, fontWeight: 'bold' },
                        itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' }
                    },
                    data: entries.map(([name, value]) => ({ name, value })),
                    animationType: 'scale',
                    animationEasing: 'cubicOut',
                    animationDelay: function () {
                        return Math.random() * 200;
                    }
                },
            ],
            backgroundColor: 'transparent',
            animationDuration: 1500,
        } as ECBasicOption
    }

    function getIncomeVsExpenseOption() {
        return {
            textStyle: commonTextStyle,
            tooltip: { ...modernTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
            legend: { 
                data: ['Income', 'Expenses'], 
                textStyle: { ...commonTextStyle, color: getTextColor() },
                icon: 'circle'
            },
            grid: { left: '3%', right: '3%', bottom: '5%', top: '15%', containLabel: true },
            xAxis: { 
                type: 'category', 
                data: ['This Period'], 
                axisLabel: { ...commonTextStyle, color: getTextColor(), fontWeight: 500 },
                axisLine: { lineStyle: { color: getGridLineColor() } },
                axisTick: { show: false }
            },
            yAxis: { 
                type: 'value', 
                axisLabel: { ...commonTextStyle, color: getTextColor(), formatter: '£{value}' },
                splitLine: { lineStyle: { color: getGridLineColor(), type: 'dashed' } }
            },
            series: [
                { 
                    name: 'Income', 
                    type: 'bar', 
                    data: [data.total_income], 
                    color: '#0099FF', 
                    barMaxWidth: 40,
                    itemStyle: { borderRadius: [6, 6, 0, 0] },
                },
                { 
                    name: 'Expenses', 
                    type: 'bar', 
                    data: [data.total_expenses], 
                    color: '#0000EE', 
                    barMaxWidth: 40,
                    itemStyle: { borderRadius: [6, 6, 0, 0] },
                },
            ],
            backgroundColor: 'transparent',
            animationDuration: 1500,
            animationEasing: 'cubicOut',
        } as any
    }

    function getTopMerchantsOption() {
        const sorted = [...data.top_merchants].sort((a, b) => a.total - b.total).slice(-8)
        return {
            textStyle: commonTextStyle,
            tooltip: { ...modernTooltip, trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '2%', right: '5%', bottom: '2%', top: '2%', containLabel: true },
            xAxis: { 
                type: 'value', 
                axisLabel: { ...commonTextStyle, color: getTextColor(), formatter: '£{value}' },
                splitLine: { lineStyle: { color: getGridLineColor(), type: 'dashed' } }
            },
            yAxis: { 
                type: 'category', 
                data: sorted.map((m) => m.name), 
                axisLabel: { ...commonTextStyle, color: getTextColor(), fontWeight: 500 },
                axisLine: { lineStyle: { color: getGridLineColor() } },
                axisTick: { show: false }
            },
            series: [
                {
                    type: 'bar',
                    data: sorted.map((m) => m.total),
                    color: '#0099FF',
                    barMaxWidth: 20,
                    itemStyle: { borderRadius: [0, 6, 6, 0] },
                    showBackground: true,
                    backgroundStyle: { color: theme.value === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: [0, 6, 6, 0] }
                },
            ],
            backgroundColor: 'transparent',
            animationDuration: 1500,
            animationEasing: 'cubicOut',
        } as any
    }

    return { getSpendingByCategoryOption, getIncomeVsExpenseOption, getTopMerchantsOption }
}
