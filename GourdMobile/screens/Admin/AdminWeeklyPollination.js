import React, { useState, useEffect } from 'react';
import { View, Dimensions, StyleSheet, ScrollView, Text, ActivityIndicator } from 'react-native';
import { Card } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const screenWidth = Dimensions.get('window').width;

const WeeklyPollinationAdmin = () => {
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetchWeeklyStats();
  }, []);

  const fetchWeeklyStats = async () => {
    setLoadingStats(true);
    try {
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) {
        setError('No authentication token found');
        setLoadingStats(false);
        return;
      }

      const response = await axios.get(`${baseURL}Monitoring`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const weeklyDataMap = {};

        response.data.forEach((record) => {
          const date = new Date(record.dateOfPollination);
          const weekNumber = getWeekNumber(date);
          const year = date.getFullYear();
          const weekYear = `Week ${weekNumber} ${year}`;
          const plotNo = record.plotNo || 'Unknown Plot';
          const gourdType = record.gourdType?.name || 'Unknown Gourd Type';

          if (!weeklyDataMap[plotNo]) {
            weeklyDataMap[plotNo] = {};
          }

          if (!weeklyDataMap[plotNo][gourdType]) {
            weeklyDataMap[plotNo][gourdType] = {};
          }

          const pollinatedCount = record.pollinatedFlowerImages ? record.pollinatedFlowerImages.length : 0;
          if (weeklyDataMap[plotNo][gourdType][weekYear]) {
            weeklyDataMap[plotNo][gourdType][weekYear] += pollinatedCount;
          } else {
            weeklyDataMap[plotNo][gourdType][weekYear] = pollinatedCount;
          }        });

        const formattedData = Object.keys(weeklyDataMap).map((plotNo) => {
          const gourdTypesData = Object.keys(weeklyDataMap[plotNo]).map((gourdType) => {
            const plotData = Object.keys(weeklyDataMap[plotNo][gourdType]).map((key, index) => ({
              value: weeklyDataMap[plotNo][gourdType][key],
              label: key,
              frontColor: getBarColor(index),
            }));

            plotData.sort((a, b) => {
              const [weekA, yearA] = a.label.split(' ').slice(1);
              const [weekB, yearB] = b.label.split(' ').slice(1);

              return yearA === yearB
                ? weekA - weekB
                : yearA - yearB;
            });

            return { gourdType, data: plotData };
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
    setLoadingStats(false);
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getBarColor = (index) => {
    const colors = ['#0BA5A4', '#FF6347', '#FFC107', '#4CAF50', '#1976D2', '#6A1B9A'];
    return colors[index % colors.length];
  };

  return (
    <ScrollView style={styles.bg}>
      <Text style={styles.screenTitle}>
        <Icon name="chart-bar" size={22} color="#0BA5A4" /> Weekly Pollination Overview
      </Text>
      {loadingStats ? (
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#0BA5A4" /></View>
      ) : weeklyStats.length === 0 ? (
        <Text style={styles.noDataText}>No pollination records found.</Text>
      ) : weeklyStats.map((plotData, index) => (
        <Card key={index} style={styles.card}>
          <Card.Content>
            <View style={styles.cardTitleRow}>
              <Icon name="format-list-bulleted-type" size={20} color="#4B5563" />
              <Text style={styles.header}>Plot #{plotData.plotNo}</Text>
            </View>
            {plotData.gourdTypesData.map((gourdData, gourdIndex) => (
              <View key={gourdIndex}>
                <Text style={styles.subHeader}>
                  <Icon name="leaf" size={14} color="#0BA5A4" /> {gourdData.gourdType}
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.chartContainer}>
                    <BarChart
                      data={gourdData.data}
                      barWidth={30}
                      barBorderRadius={8}
                      yAxisColor="#0BA5A4"
                      xAxisColor="#0BA5A4"
                      xAxisLabelTextStyle={{ color: '#3d3d3d', fontSize: 9 }}
                      yAxisTextStyle={{ color: '#3d3d3d', fontSize: 9 }}
                      noOfSections={4}
                      width={Math.max(screenWidth, 80 + gourdData.data.length * 40)}
                      hideRules
                      showVerticalLines
                      verticalLinesColor="rgba(14,164,164,0.13)"
                      isAnimated
                    />
                  </View>
                </ScrollView>
              </View>
            ))}
            {error && <Text style={styles.error}>{error}</Text>}
          </Card.Content>
        </Card>
      ))}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bg: { backgroundColor: "#f6fafd" },
  screenTitle: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#0BA5A4",
    textAlign: "center",
    marginTop: 22,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  card: {
    margin: 9,
    borderRadius: 16,
    backgroundColor: '#fff',
    shadowColor: '#0BA5A4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.11,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#e6eced',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    marginLeft: 2,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 7,
    color: '#2A4747',
    marginLeft: 5,
  },
  subHeader: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    color: '#0BA5A4',
    marginTop: 2,
    marginLeft: 9,
  },
  chartContainer: {
    paddingVertical: 6,
    paddingRight: 8,
    paddingLeft: 2,
    marginBottom: 2,
    marginTop: 2,
    minHeight: 155,
    backgroundColor: "#fafdff",
    borderRadius: 10,
  },
  noDataText: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginTop: 34,
    marginBottom: 12,
    fontStyle: "italic"
  },
  error: {
    color: '#F44336',
    textAlign: 'center',
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600"
  },
  loadingContainer: {
    marginTop: 40,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center"
  }
});

export default WeeklyPollinationAdmin;