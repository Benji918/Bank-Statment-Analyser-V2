import type { InsightData } from '@/types/insight.types'

export function useInsightCharts(data: InsightData) {
    function getSpendingByCategoryOption() {
        const entries = Object.entries(data.spending_by_category)
        return {
            tooltip: { trigger: 'item', formatter: '{b}: £{c} ({d}%)' },
            legend: { orient: 'vertical', left: 'left', textStyle: { color: '#fff' } },
            series: [
                {
                    name: 'Spending',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: { borderRadius: 6, borderColor: '#000', borderWidth: 2 },
                    label: { show: false },
                    emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
                    data: entries.map(([name, value]) => ({ name, value })),
                },
            ],
            backgroundColor: 'transparent',
        }
    }

    function getIncomeVsExpenseOption() {
        return {
            tooltip: { trigger: 'axis' },
            legend: { data: ['Income', 'Expenses'], textStyle: { color: '#fff' } },
            xAxis: { type: 'category', data: ['This Period'], axisLabel: { color: '#fff' } },
            yAxis: { type: 'value', axisLabel: { color: '#fff', formatter: '£{value}' } },
            series: [
                { name: 'Income', type: 'bar', data: [data.total_income], color: '#0099FF', barMaxWidth: 60 },
                { name: 'Expenses', type: 'bar', data: [data.total_expenses], color: '#0000EE', barMaxWidth: 60 },
            ],
            backgroundColor: 'transparent',
        }
    }

    function getTopMerchantsOption() {
        const sorted = [...data.top_merchants].sort((a, b) => b.total - a.total).slice(0, 8)
        return {
            tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', axisLabel: { color: '#fff', formatter: '£{value}' } },
            yAxis: { type: 'category', data: sorted.map((m) => m.name), axisLabel: { color: '#fff' } },
            series: [
                {
                    type: 'bar',
                    data: sorted.map((m) => m.total),
                    color: '#0099FF',
                    barMaxWidth: 30,
                    itemStyle: { borderRadius: [0, 4, 4, 0] },
                },
            ],
            backgroundColor: 'transparent',
        }
    }

    return { getSpendingByCategoryOption, getIncomeVsExpenseOption, getTopMerchantsOption }
}
