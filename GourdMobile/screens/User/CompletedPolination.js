import React, { useState, useEffect, useContext } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const Dashboard = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [successRate, setSuccessRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchData();
    }
  }, [context.stateUser.isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchWeeklyStats(), fetchSuccessRate()]);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
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
        const weeklyDataMap = {};

        response.data.forEach((record) => {
          if (record.status !== 'Completed') return;

          const date = new Date(record.dateOfFinalization || record.updatedAt || record.createdAt || record.dateOfPollination);
          const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
          const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}/${weekStart.getFullYear()}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';

          if (!weeklyDataMap[plotNo]) {
            weeklyDataMap[plotNo] = {};
          }

          if (!weeklyDataMap[plotNo][gourdType]) {
            weeklyDataMap[plotNo][gourdType] = {
              lineData: {},
              barData: {},
              activeTab: 'line' // Default to line chart
            };
          }

          const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0;

          if (weeklyDataMap[plotNo][gourdType].lineData[weekLabel]) {
            weeklyDataMap[plotNo][gourdType].lineData[weekLabel] += pollinatedCount;
            weeklyDataMap[plotNo][gourdType].barData[weekLabel] += pollinatedCount;
          } else {
            weeklyDataMap[plotNo][gourdType].lineData[weekLabel] = pollinatedCount;
            weeklyDataMap[plotNo][gourdType].barData[weekLabel] = pollinatedCount;
          }
        });

        const formattedData = Object.keys(weeklyDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(weeklyDataMap[plotNo]).map((gourdType) => {
            // Process line chart data
            const lineChartData = Object.keys(weeklyDataMap[plotNo][gourdType].lineData).map((key) => ({
              value: weeklyDataMap[plotNo][gourdType].lineData[key],
              dataPointText: weeklyDataMap[plotNo][gourdType].lineData[key].toString(),
              label: key
            }));

            // Process bar chart data
            const barChartData = Object.keys(weeklyDataMap[plotNo][gourdType].barData).map((key, index) => ({
              value: weeklyDataMap[plotNo][gourdType].barData[key],
              label: key,
              frontColor: getColorForIndex(index),
              topLabelComponent: () => (
                <Text style={{ fontSize: 10, color: '#333' }}>
                  {weeklyDataMap[plotNo][gourdType].barData[key]}
                </Text>
              ),
            }));

            // Process pie chart data
            const pieChartData = Object.keys(weeklyDataMap[plotNo][gourdType].barData).map((key, index) => ({
              value: weeklyDataMap[plotNo][gourdType].barData[key],
              label: key,
              color: getColorForIndex(index),
            }));

            // Sort all data by date
            const sortByDate = (a, b) => new Date(a.label) - new Date(b.label);
            lineChartData.sort(sortByDate);
            barChartData.sort(sortByDate);

            return { 
              gourdType, 
              lineData: [{ value: 0, label: '' }, ...lineChartData],
              barData: barChartData,
              pieData: pieChartData,
              activeTab: weeklyDataMap[plotNo][gourdType].activeTab
            };
          });

          return { plotNo, gourdTypesData };
        });

        setWeeklyStats(formattedData);
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch statistics');
    }
  };

  const fetchSuccessRate = async () => {
    try {
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
        const completedRecords = response.data.filter(record => record.status === 'Completed');
        const totalPollinatedFlowers = completedRecords.reduce(
          (sum, record) => sum + (Array.isArray(record.pollinatedFlowerImages) ? record.pollinatedFlowerImages.length : 0), 0
        );
        const totalFruitsHarvested = completedRecords.reduce(
          (sum, record) => sum + (Array.isArray(record.fruitHarvestedImages) ? record.fruitHarvestedImages.length : 0), 0
        );

        const rate = totalPollinatedFlowers > 0 ? (totalFruitsHarvested / totalPollinatedFlowers) * 100 : 0;
        setSuccessRate(rate.toFixed(2));
        setError(null);
      } else {
        setError('Data is not in expected array format');
      }
    } catch (error) {
      setError('Failed to fetch success rate');
    }
  };

  const handleTabChange = (plotIndex, gourdIndex, tab) => {
    setWeeklyStats(prevStats => {
      const newStats = [...prevStats];
      newStats[plotIndex].gourdTypesData[gourdIndex].activeTab = tab;
      return newStats;
    });
  };

  const getColorForIndex = (index) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#E91E63'];
    return colors[index % colors.length];
  };

  const renderLineChart = (data) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View>
      <LineChart
        initialSpacing={15}
        data={data}
        spacing={40}
        thickness={3}
        color="#2E7D32"  // Rich green color
        hideRules={false}
        rulesColor="#E0E0E0"  // Light gray rules
        rulesType="dashed"
        yAxisColor="#2E7D32"
        xAxisColor="#2E7D32"
        xAxisLabelTextStyle={{ 
          color: '#666', 
          fontSize: 10,
          marginTop: 4
        }}
        yAxisTextStyle={{ 
          color: '#666', 
          fontSize: 10 
        }}
        yAxisLabelPrefix=""
        yAxisLabelSuffix=""
        noOfSections={4}
        startAtZero
        adjustForEmptyLabel={true}
        width={screenWidth + (Array.isArray(data) ? data.length : 0) * 40}
        height={220}
        dataPointsColor="#2E7D32"
        dataPointsRadius={5}
        dataPointsWidth={4}
        curved
        isAnimated
        animationDuration={1200}
      />
    </View>
  </ScrollView>
);

  const renderBarChart = (data) => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <BarChart
        data={data}
        barWidth={22}
        barBorderRadius={4}
        yAxisThickness={0}
        xAxisThickness={0}
        yAxisTextStyle={{ color: '#666', fontSize: 10 }}
        xAxisLabelTextStyle={{ color: '#666', fontSize: 10, marginTop: 4 }}
        noOfSections={4}
        width={Math.max(screenWidth, data.length * 60)}
        height={220}
        showGradient
        gradientColor="#4CAF50"
        spacing={20}
        initialSpacing={10}
        isAnimated
      />
    </ScrollView>
  );

  const renderPieChart = (data) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <View style={styles.pieContainer}>
        <PieChart
          data={data}
          donut
          showText
          textColor="#333"
          radius={90}
          innerRadius={60}
          textSize={10}
          focusOnPress
          showValuesAsLabels
          showTextBackground
          textBackgroundRadius={15}
          centerLabelComponent={() => (
            <View style={styles.pieCenterLabel}>
              <Text style={styles.pieCenterText}>Total</Text>
              <Text style={styles.pieCenterValue}>{total}</Text>
            </View>
          )}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Icon name="error-outline" size={40} color="#F44336" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchData}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {weeklyStats.map((plotData, plotIndex) => (
        <Card key={plotIndex} style={styles.card}>
          <Card.Content>
            <Text style={styles.header}>Weekly Pollinated Flowers - Plot No.{plotData.plotNo}</Text>
            {plotData.gourdTypesData && plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex} style={styles.chartContainer}>
                <Text style={styles.subHeader}>Gourd Type: {gourdData.gourdType}</Text>
                
                <View style={styles.tabContainer}>
                  <TouchableOpacity
                    style={[styles.tabButton, gourdData.activeTab === 'line' && styles.activeTab]}
                    onPress={() => handleTabChange(plotIndex, gourdIndex, 'line')}
                  >
                    <Text style={styles.tabText}>Line</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, gourdData.activeTab === 'bar' && styles.activeTab]}
                    onPress={() => handleTabChange(plotIndex, gourdIndex, 'bar')}
                  >
                    <Text style={styles.tabText}>Bar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.tabButton, gourdData.activeTab === 'pie' && styles.activeTab]}
                    onPress={() => handleTabChange(plotIndex, gourdIndex, 'pie')}
                  >
                    <Text style={styles.tabText}>Pie</Text>
                  </TouchableOpacity>
                </View>

                {gourdData.activeTab === 'line' && renderLineChart(gourdData.lineData)}
                {gourdData.activeTab === 'bar' && renderBarChart(gourdData.barData)}
                {gourdData.activeTab === 'pie' && renderPieChart(gourdData.pieData)}
              </View>
            ))}
          </Card.Content>
        </Card>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    margin: 8,
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
    color: '#2E7D32',
  },
  subHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  chartContainer: {
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#EEE',
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
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: {
    fontWeight: '500',
    color: '#333',
  },
  successRate: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#4CAF50',
    marginVertical: 16,
  },
  pieContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  pieCenterLabel: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenterText: {
    fontSize: 12,
    color: '#666',
  },
  pieCenterValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default Dashboard;