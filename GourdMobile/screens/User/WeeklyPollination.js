import React, { useState, useEffect, useContext } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Card } from 'react-native-paper';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const screenWidth = Dimensions.get('window').width;

const WeeklyPollination = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const context = useContext(AuthGlobal);

  useEffect(() => {
    if (context.stateUser.isAuthenticated === true) {
      fetchWeeklyStats();
    }
  }, [context.stateUser.isAuthenticated]);

  const fetchWeeklyStats = async () => {
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
        const weeklyDataMap = processWeeklyData(response.data);
        setWeeklyStats(weeklyDataMap);
        setError(null);
      } else {
        setError('Data is not in expected format');
      }
    } catch (error) {
      setError('Failed to fetch statistics');
      console.error('API Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const processWeeklyData = (data) => {
    const weeklyDataMap = {};

    data.forEach((record) => {
      const date = new Date(record.dateOfPollination);
      const weekNumber = getWeekNumber(date);
      const year = date.getFullYear();
      const weekYear = `Week ${weekNumber} ${year}`;
      const plotNo = record.plotNo || 'Unknown Plot';
      const gourdType = record.gourdType?.name || 'Unknown';

      if (!weeklyDataMap[plotNo]) {
        weeklyDataMap[plotNo] = {};
      }

      if (!weeklyDataMap[plotNo][gourdType]) {
        weeklyDataMap[plotNo][gourdType] = {};
      }

      const pollinatedCount = Array.isArray(record.pollinatedFlowerImages) 
        ? record.pollinatedFlowerImages.length 
        : 0;

      weeklyDataMap[plotNo][gourdType][weekYear] = 
        (weeklyDataMap[plotNo][gourdType][weekYear] || 0) + pollinatedCount;
    });

    return Object.keys(weeklyDataMap).map((plotNo) => {
      const gourdTypesData = Object.keys(weeklyDataMap[plotNo]).map((gourdType) => {
        const plotData = Object.keys(weeklyDataMap[plotNo][gourdType]).map((weekYear, index) => ({
          value: weeklyDataMap[plotNo][gourdType][weekYear],
          label: weekYear,
          frontColor: getColorForIndex(index),
          labelTextStyle: { color: '#666', fontSize: 10 },
          topLabelComponent: () => (
            <Text style={{ fontSize: 10, color: '#333' }}>
              {weeklyDataMap[plotNo][gourdType][weekYear]}
            </Text>
          ),
        }));

        plotData.sort((a, b) => {
          const [weekA, yearA] = a.label.split(' ').slice(1);
          const [weekB, yearB] = b.label.split(' ').slice(1);
          return yearA === yearB ? weekA - weekB : yearA - yearB;
        });

        return { 
          gourdType, 
          data: plotData,
          total: plotData.reduce((sum, item) => sum + item.value, 0),
          activeTab: 'bar' // Each chart now has its own tab state
        };
      });

      return { 
        plotNo, 
        gourdTypesData,
        total: gourdTypesData.reduce((sum, item) => sum + item.total, 0)
      };
    });
  };

  const handleTabChange = (plotIndex, gourdIndex, tab) => {
    setWeeklyStats(prevStats => {
      const newStats = [...prevStats];
      newStats[plotIndex].gourdTypesData[gourdIndex].activeTab = tab;
      return newStats;
    });
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getColorForIndex = (index) => {
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#607D8B', '#E91E63'];
    return colors[index % colors.length];
  };

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
    const pieData = data.map((item, index) => ({
      value: item.value,
      color: getColorForIndex(index),
      text: item.label,
    }));

    return (
      <View style={styles.pieContainer}>
        <PieChart
          data={pieData}
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
              <Text style={styles.pieCenterValue}>
                {pieData.reduce((sum, item) => sum + item.value, 0)}
              </Text>
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
          onPress={fetchWeeklyStats}
        >
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {weeklyStats.length === 0 ? (
        <View style={styles.emptyState}>
          <Icon name="assignment" size={50} color="#BDBDBD" />
          <Text style={styles.emptyText}>No pollination data available</Text>
          <Text style={styles.emptySubtext}>Your weekly statistics will appear here</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {weeklyStats.map((plotData, plotIndex) => (
            <Card key={plotIndex} style={styles.card}>
              <Card.Content>
                <View style={styles.plotHeader}>
                  <Icon name="map" size={20} color="#4CAF50" />
                  <Text style={styles.plotTitle}>Plot {plotData.plotNo}</Text>
                  <Text style={styles.plotTotal}>
                    {plotData.total} total pollinations
                  </Text>
                </View>

                {plotData.gourdTypesData.map((gourdData, gourdIndex) => (
                  <View key={gourdIndex} style={styles.gourdContainer}>
                    <View style={styles.gourdHeader}>
                      <Icon name="spa" size={18} color="#2196F3" />
                      <Text style={styles.gourdTitle}>{gourdData.gourdType}</Text>
                      <Text style={styles.gourdTotal}>{gourdData.total} flowers</Text>
                    </View>

                    <View style={styles.tabContainer}>
                      <TouchableOpacity
                        style={[styles.tabButton, gourdData.activeTab === 'bar' && styles.activeTab]}
                        onPress={() => handleTabChange(plotIndex, gourdIndex, 'bar')}
                      >
                        <Text style={styles.tabText}>Bar Chart</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.tabButton, gourdData.activeTab === 'pie' && styles.activeTab]}
                        onPress={() => handleTabChange(plotIndex, gourdIndex, 'pie')}
                      >
                        <Text style={styles.tabText}>Pie Chart</Text>
                      </TouchableOpacity>
                    </View>

                    {gourdData.activeTab === 'bar' 
                      ? renderBarChart(gourdData.data) 
                      : renderPieChart(gourdData.data)}
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
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
  mainHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  plotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  plotTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginLeft: 8,
  },
  plotTotal: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#757575',
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
  gourdContainer: {
    marginBottom: 20,
  },
  gourdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  gourdTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  gourdTotal: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#757575',
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#616161',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9E9E9E',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default WeeklyPollination;