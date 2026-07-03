<script setup lang="ts">
import { computed } from 'vue';
import VChart from 'vue-echarts';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { BarChart, LineChart, PieChart } from 'echarts/charts';
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components';
import { formatChartValue, formatCompactNumber, type ChartValueFormat } from '../utils/chartFormatting';
import { chartPalette, resolveToneColor, toneAccentClass, toneWidgetClass, type ToneKey } from '../utils/designSystem';

use([CanvasRenderer, BarChart, LineChart, PieChart, GridComponent, LegendComponent, TooltipComponent]);

const props = defineProps<{
  title: string;
  type: 'bar' | 'line' | 'pie';
  data: Record<string, any>[];
  valueFormat?: ChartValueFormat;
  tone?: ToneKey;
}>();

const valueFormat = computed(() => props.valueFormat ?? 'currency');
const xAxisLabels = computed(() => props.data.map((item) => item.name ?? item.month));

const seriesKeys = computed(() => {
  if (props.type === 'pie') return [];
  if (props.data.length === 0) return [];
  return Object.keys(props.data[0]).filter((k) => k !== 'name' && k !== 'month');
});

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
        textStyle: { color: '#77736F', fontSize: 12 },
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
    legend: seriesKeys.value.length > 1 ? {
      type: 'scroll',
      bottom: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: '#77736F', fontSize: 12 },
    } : undefined,
    grid: { left: 56, right: 24, top: 20, bottom: props.type === 'line' ? 72 : 48, containLabel: true },
    xAxis: {
      type: 'category',
      data: xAxisLabels.value,
      axisLabel: {
        color: '#77736F',
        interval: props.type === 'bar' ? 0 : 'auto',
        width: props.type === 'bar' ? 70 : undefined,
        overflow: props.type === 'bar' ? 'break' : undefined,
        lineHeight: 14,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => (valueFormat.value === 'currency' ? formatCompactNumber(value) : formatChartValue(value, valueFormat.value)),
        color: '#77736F',
      },
      splitLine: { lineStyle: { color: '#D6CEC3' } },
    },
    series: seriesKeys.value.map((key, index) => ({
      name: key === 'value' ? undefined : key,
      type: props.type,
      data: props.data.map((item) => item[key]),
      color: index === 0 ? resolveToneColor(props.tone) : chartPalette[index % chartPalette.length],
      smooth: props.type === 'line',
      symbolSize: props.type === 'line' ? 7 : undefined,
      lineStyle: props.type === 'line' ? { width: 3 } : undefined,
      itemStyle: props.type === 'bar' ? { borderRadius: [6, 6, 0, 0] } : undefined,
    })),
  };
});
</script>

<template>
  <div class="panel overflow-hidden p-5 transition duration-300 hover:shadow-lg" :class="toneWidgetClass(tone ?? 'green')">
    <div class="mb-4 flex items-center gap-3">
      <span class="h-8 w-1 rounded-full" :class="toneAccentClass(tone ?? 'green')"></span>
      <h3 class="text-sm font-semibold text-ink">{{ title }}</h3>
    </div>
    <VChart class="h-64 w-full sm:h-72" :option="option" autoresize />
  </div>
</template>
