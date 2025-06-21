import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { PieChart, BarChart, LineChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const TypiePie = () => {
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
    lineData: [],
    activeTab: 'pie' // Default to pie chart
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchGourdTypesData();
    }
  }, [context.stateUser.isAuthenticated]);

  const fetchGourdTypesData = async () => {
    try {
      setLoading(true);
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        return;
      }

      const userId = context.stateUser?.user?.userId;
      if (!userId) {
        setError('User ID is missing');
        return;
      }

      const response = await axios.get(`${baseURL}Monitoring/${userId}`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const gourdTypesMap = {};
        const weeklyDataMap = {};

        // Process data for all chart types
        response.data.forEach((record) => {
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';
          const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) ?
            record.pollinatedFlowerImages.length : 0;

          if (pollinatedCount > 0) {
            // For pie and bar charts
            if (gourdTypesMap[gourdType]) {
              gourdTypesMap[gourdType] += pollinatedCount;
            } else {
              gourdTypesMap[gourdType] = pollinatedCount;
            }

            // For line chart (weekly data)
            const date = new Date(record.dateOfPollination || record.createdAt);
            const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
            const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;

            if (!weeklyDataMap[gourdType]) {
              weeklyDataMap[gourdType] = {};
            }

            if (weeklyDataMap[gourdType][weekLabel]) {
              weeklyDataMap[gourdType][weekLabel] += pollinatedCount;
            } else {
              weeklyDataMap[gourdType][weekLabel] = pollinatedCount;
            }
          }
        });

        const totalPollinatedFlowers = Object.values(gourdTypesMap).reduce((a, b) => a + b, 0);
        const colorPalette = [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#FFCD56', '#C9CBCF'
        ];

        // Prepare pie chart data
        const pieData = Object.keys(gourdTypesMap).map((key, index) => ({
          value: gourdTypesMap[key],
          label: key,
          percentage: ((gourdTypesMap[key] / totalPollinatedFlowers) * 100).toFixed(2),
          color: colorPalette[index % colorPalette.length],
          text: `${((gourdTypesMap[key] / totalPollinatedFlowers) * 100).toFixed(1)}%`
        }));

        // Prepare bar chart data
        const barData = Object.keys(gourdTypesMap).map((key, index) => ({
          value: gourdTypesMap[key],
          label: key,
          frontColor: colorPalette[index % colorPalette.length],
          topLabelComponent: () => (
            <Text style={{ fontSize: 10, color: '#333' }}>
              {gourdTypesMap[key]}
            </Text>
          ),
        }));

        // Prepare line chart data
        const lineData = Object.keys(weeklyDataMap).map((gourdType, index) => {
          const weeklyData = Object.keys(weeklyDataMap[gourdType]).map(week => ({
            value: weeklyDataMap[gourdType][week],
            label: week,
            dataPointText: weeklyDataMap[gourdType][week].toString(),
          })).sort((a, b) => {
            // Sort by week
            const [dayA, monthA] = a.label.split('/').map(Number);
            const [dayB, monthB] = b.label.split('/').map(Number);
            return monthA - monthB || dayA - dayB;
          });

          return {
            gourdType,
            data: weeklyData,
            color: colorPalette[index % colorPalette.length],
            dataPointsColor: colorPalette[index % colorPalette.length],
          };
        });

        setChartData({
          pieData,
          barData,
          lineData,
          activeTab: 'pie'
        });
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch gourd types data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setChartData(prev => ({ ...prev, activeTab: tab }));
  };

  const renderDot = (color) => {
    return (
      <View
        style={{
          height: 10,
          width: 10,
          borderRadius: 5,
          backgroundColor: color,
          marginRight: 10,
        }}
      />
    );
  };

  const renderLegendComponent = () => {
    if (chartData.activeTab === 'line') return null;

    const data = chartData.activeTab === 'pie' ? chartData.pieData : chartData.barData;

    return (
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            {renderDot(item.color || item.frontColor)}
            <Text style={styles.legendText}>
              {item.label}: {chartData.activeTab === 'pie' ? `${item.percentage}%` : item.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderPieChart = () => (
    <View style={styles.chartContainer}>
      <PieChart
        data={chartData.pieData}
        showText
        textColor="black"
        radius={100}
        textSize={15}
        focusOnPress
        showValuesAsLabels
        showTextBackground
        textBackgroundRadius={20}
        centerLabelComponent={() => (
          <View style={styles.centerLabelContainer}>
            <Text style={styles.centerLabelTitle}>Total</Text>
            <Text style={styles.centerLabelValue}>
              {chartData.pieData.reduce((sum, item) => sum + item.value, 0)}
            </Text>
          </View>
        )}
      />
    </View>
  );

  const renderBarChart = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <BarChart
        data={chartData.barData}
        barWidth={22}
        barBorderRadius={4}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{ color: '#666', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#666', fontSize: 10, marginTop: 4 }}
        noOfSections={4}
        width={Math.max(400, chartData.barData.length * 60)}
        height={220}
        showGradient
        gradientColor="#36A2EB"
        spacing={20}
        initialSpacing={10}
        isAnimated
      />
    </ScrollView>
  );

  const renderLineChart = () => (
    <ScrollView
      style={styles.trendContainer}
      showsVerticalScrollIndicator={true}
    >
      {chartData.lineData.map((series, index) => {
        // Process data to ensure no decimal values
        const integerData = series.data.map(item => ({
          value: Math.round(item.value),
          label: item.label,
          dataPointText: Math.round(item.value).toString()
        }));

        return (
          <View key={index} style={styles.lineChartSection}>
            <Text style={styles.lineSeriesHeader}>{series.gourdType}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.chartScrollContent}
            >
              <LineChart
                data={integerData}
                spacing={40}
                thickness={2}
                color={series.color}
                hideRules
                yAxisColor={series.color}
                xAxisColor={series.color}
                xAxisLabelTextStyle={{ color: 'gray', fontSize: 10 }}
                yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                noOfSections={4}
                startAtZero
                adjustForEmptyLabel={true}
                width={Math.max(screenWidth * 1.5, integerData.length * 60)}
                height={180}
                dataPointsRadius={6}
                dataPointsColor={series.dataPointsColor}
                dataPointsWidth={2}
                yAxisLabelTextStyle={{
                  color: 'gray',
                  fontSize: 10,
                  formatter: (value) => Math.round(value).toString()
                }}
                dataPointsLabelComponent={({ value }) => (
                  <Text style={{ fontSize: 10, color: 'black' }}>
                    {Math.round(value)}
                  </Text>
                )}
              />
            </ScrollView>
          </View>
        );
      })}
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#36A2EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color="#FF6384" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchGourdTypesData}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.header}>Pollination by Gourd Type</Text>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, chartData.activeTab === 'pie' && styles.activeTab]}
            onPress={() => handleTabChange('pie')}
          >
            <Text style={styles.tabText}>Pie</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, chartData.activeTab === 'bar' && styles.activeTab]}
            onPress={() => handleTabChange('bar')}
          >
            <Text style={styles.tabText}>Bar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, chartData.activeTab === 'line' && styles.activeTab]}
            onPress={() => handleTabChange('line')}
          >
            <Text style={styles.tabText}>Trend</Text>
          </TouchableOpacity>
        </View>

        {chartData.activeTab === 'pie' && renderPieChart()}
        {chartData.activeTab === 'bar' && renderBarChart()}
        {chartData.activeTab === 'line' && renderLineChart()}

        {renderLegendComponent()}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#36A2EB',
  },
  error: {
    color: '#FF6384',
    textAlign: 'center',
    marginTop: 20,
  },
  chartContainer: {
    padding: 20,
    alignItems: 'center',
    minHeight: 250,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  legendText: {
    fontSize: 12,
  },
  centerLabelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  centerLabelValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#36A2EB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF6384',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#36A2EB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#e1f0ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontWeight: '500',
    color: '#36A2EB',
  },
  // New styles for trend view
  trendContainer: {
    maxHeight: screenHeight * 0.6, // Fixed max height for trend container
    paddingBottom: 20,
  },
  lineChartSection: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  lineSeriesHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  chartScrollContent: {
    paddingRight: 20,
  },
});

export default TypiePie;