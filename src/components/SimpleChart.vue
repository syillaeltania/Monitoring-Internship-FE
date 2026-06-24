<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { formatChartValue, formatCompactNumber, type ChartValueFormat } from '../utils/chartFormatting';
import { chartPalette, toneAccentClass, toneWidgetClass, type ToneKey } from '../utils/designSystem';

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent]);

const props = defineProps<{
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: { name?: string; month?: string; value: number }[];
  valueFormat?: ChartValueFormat;
  tone?: ToneKey;
}>();

const valueFormat = computed(() => props.valueFormat ?? 'currency');
const xAxisLabels = computed(() => props.data.map((item) => item.name ?? item.month));
const xAxisInterval = computed(() => (props.type === 'line' && xAxisLabels.value.length > 12 ? Math.ceil(xAxisLabels.value.length / 12) - 1 : 0));

const option = computed(() => {
  if (props.type === 'pie') {
    return {
      tooltip: {
        trigger: 'item',
        valueFormatter: (value: number) => formatChartValue(value, valueFormat.value),
      },
      legend: {
        type: 'scroll',
        bottom: 0,
        left: 'center',
        itemWidth: 10,
        itemHeight: 10,
        textStyle: { color: '#475569', fontSize: 12 },
      },
      series: [
        {
              type: 'pie',
              radius: ['42%', '68%'],
              center: ['50%', '43%'],
              avoidLabelOverlap: true,
              label: { show: false },
              labelLine: { show: false },
              color: chartPalette,
              data: props.data,
            },
          ],
    };
  }
  return {
    tooltip: {
      trigger: 'axis',
      valueFormatter: (value: number) => formatChartValue(value, valueFormat.value),
    },
    grid: { left: 56, right: 24, top: 20, bottom: props.type === 'line' ? 72 : 48, containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisLabels.value,
      axisLabel: {
        interval: xAxisInterval.value,
        rotate: props.type === 'line' ? 35 : 0,
        margin: props.type === 'line' ? 16 : 8,
        width: props.type === 'line' ? 86 : 72,
        overflow: 'truncate',
        color: '#6b7280',
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => (valueFormat.value === 'currency' ? formatCompactNumber(value) : formatChartValue(value, valueFormat.value)),
        color: '#6b7280',
      },
      splitLine: { lineStyle: { color: '#e2e8f0' } },
    },
    series: [
      {
        type: props.type,
        data: props.data.map((item) => item.value),
        color: props.type === 'line' ? '#2563eb' : '#1f9d6a',
        smooth: props.type === 'line',
        symbolSize: props.type === 'line' ? 7 : undefined,
        lineStyle: props.type === 'line' ? { width: 3 } : undefined,
        itemStyle: props.type === 'bar' ? { borderRadius: [6, 6, 0, 0] } : undefined,
      },
    ],
  };
});
</script>

<template>
  <div class="panel overflow-hidden bg-gradient-to-br p-5 ring-1 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl" :class="toneWidgetClass(tone ?? 'green')">
    <div class="mb-4 flex items-center gap-3">
      <span class="h-8 w-1 rounded-full" :class="toneAccentClass(tone ?? 'green')"></span>
      <h3 class="text-sm font-semibold text-ink">{{ title }}</h3>
    </div>
    <VChart class="h-64 w-full sm:h-72" :option="option" autoresize />
  </div>
</template>
