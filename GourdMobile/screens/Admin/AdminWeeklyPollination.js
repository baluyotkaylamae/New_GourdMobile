import React, { useState, useEffect } from 'react';
import { 
  View, 
  Dimensions, 
  StyleSheet, 
  ScrollView, 
  Text, 
  Animated, 
  Easing,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Card, useTheme, FAB, TouchableRipple } from 'react-native-paper';
import { BarChart } from 'react-native-gifted-charts';
import axios from 'axios';
import baseURL from '../../assets/common/baseurl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: screenWidth } = Dimensions.get('window');

const WeeklyPollinationAdmin = () => {
  const theme = useTheme();
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [error, setError] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(30))[0];

  useEffect(() => {
    fetchWeeklyStats();
    animateScreen();
  }, []);

  const animateScreen = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fetchWeeklyStats = async () => {
    try {
      setRefreshing(true);
      const storedToken = await AsyncStorage.getItem('jwt');
      if (!storedToken) throw new Error('No authentication token found');

      const response = await axios.get(`${baseURL}Monitoring`, {
        headers: { Authorization: `Bearer ${storedToken}` },
      });

      if (Array.isArray(response.data)) {
        const weeklyDataMap = processResponseData(response.data);
        setWeeklyStats(weeklyDataMap);
        setError(null);
      } else {
        throw new Error('Data format error');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
    } finally {
      setLoadingStats(false);
      setRefreshing(false);
    }
  };

  const processResponseData = (data) => {
    const weeklyDataMap = {};
    
    data.forEach((record) => {
      const date = new Date(record.dateOfPollination);
      const weekYear = `Week ${getWeekNumber(date)} ${date.getFullYear()}`;
      const plotNo = record.plotNo || 'Unknown Plot';
      const gourdType = record.gourdType?.name || 'Unknown Gourd Type';
      const pollinatedCount = record.pollinatedFlowerImages?.length || 0;

      if (!weeklyDataMap[plotNo]) weeklyDataMap[plotNo] = {};
      if (!weeklyDataMap[plotNo][gourdType]) weeklyDataMap[plotNo][gourdType] = {};
      
      weeklyDataMap[plotNo][gourdType][weekYear] = 
        (weeklyDataMap[plotNo][gourdType][weekYear] || 0) + pollinatedCount;
    });

    return Object.entries(weeklyDataMap).map(([plotNo, gourdTypes]) => ({
      plotNo,
      gourdTypesData: Object.entries(gourdTypes).map(([gourdType, weeks]) => ({
        gourdType,
        data: Object.entries(weeks)
          .map(([week, value], index) => ({
            value,
            label: week,
            frontColor: getBarColor(index),
            topLabelComponent: () => (
              <Text style={styles.barLabel}>{value}</Text>
            ),
            labelTextStyle: styles.weekLabel,
          }))
          .sort(sortByWeek),
      })),
    }));
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const sortByWeek = (a, b) => {
    const [weekA, yearA] = a.label.split(' ').slice(1);
    const [weekB, yearB] = b.label.split(' ').slice(1);
    return yearA === yearB ? weekA - weekB : yearA - yearB;
  };

  const getBarColor = (index) => {
    const colors = [
      theme.colors.primary, 
      '#FF6584', 
      '#FFC107', 
      '#4CAF50', 
      '#2196F3', 
      '#9C27B0'
    ];
    return colors[index % colors.length];
  };

  const renderChart = (data) => (
    <BarChart
      data={data}
      barWidth={20}
      barBorderRadius={6}
      yAxisColor={theme.colors.outline}
      xAxisColor={theme.colors.outline}
      xAxisLabelTextStyle={styles.axisLabel}
      yAxisTextStyle={styles.axisLabel}
      noOfSections={5}
      width={Math.max(screenWidth - 60, 100 + data.length * 50)}
      hideRules
      showVerticalLines
      verticalLinesColor={`${theme.colors.primary}20`}
      isAnimated
      animationDuration={1200}
      yAxisLabelWidth={40}
      initialSpacing={20}
      spacing={25}
      barBorderTopLeftRadius={6}
      barBorderTopRightRadius={6}
    />
  );

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.background,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      {/* Gradient-like header using solid color with overlay */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <View style={styles.headerOverlay} />
        <View style={styles.headerContent}>
          <Icon name="chart-bar" size={28} color="white" />
          <Text style={styles.screenTitle}>Weekly Pollination</Text>
          <Text style={styles.screenSubtitle}>Visualized Data Overview</Text>
        </View>
      </View>

      {loadingStats ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Crunching the numbers...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={48} color="#FF6584" />
          <Text style={styles.errorText}>Oops! {error}</Text>
          <TouchableRipple
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={fetchWeeklyStats}
          >
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableRipple>
        </View>
      ) : weeklyStats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="database-remove" size={48} color="#A5A5A5" />
          <Text style={styles.emptyText}>No pollination data available</Text>
          <Text style={styles.emptyHint}>Start pollinating to see statistics</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchWeeklyStats}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        >
          {weeklyStats.map((plotData, index) => (
            <Card 
              key={index} 
              style={[styles.card, { backgroundColor: theme.colors.surface }]}
              mode="elevated"
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={[styles.plotBadge, { backgroundColor: theme.colors.primary }]}>
                    <Icon name="map-marker" size={16} color="white" />
                  </View>
                  <Text style={[styles.plotTitle, { color: theme.colors.text }]}>
                    Plot #{plotData.plotNo}
                  </Text>
                </View>

                {plotData.gourdTypesData.map((gourdData, gourdIndex) => (
                  <View key={gourdIndex} style={styles.gourdSection}>
                    <View style={styles.gourdHeader}>
                      <View style={[
                        styles.gourdBadge, 
                        { backgroundColor: getBarColor(gourdIndex) }
                      ]}>
                        <Icon name="leaf" size={14} color="white" />
                      </View>
                      <Text style={[styles.gourdTitle, { color: theme.colors.text }]}>
                        {gourdData.gourdType}
                      </Text>
                    </View>

                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={styles.chartScrollContainer}
                    >
                      {renderChart(gourdData.data)}
                    </ScrollView>
                  </View>
                ))}
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="refresh"
        onPress={fetchWeeklyStats}
        visible={!loadingStats && !error && weeklyStats.length > 0}
        color="white"
      />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerContent: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
    letterSpacing: 0.5,
  },
  screenSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    fontWeight: '500',
  },
  scrollContainer: {
    paddingBottom: 24,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  plotBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  plotTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  gourdSection: {
    marginBottom: 24,
  },
  gourdHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  gourdBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  gourdTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  chartScrollContainer: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  axisLabel: {
    fontSize: 10,
    color: '#A5A5A5',
  },
  barLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  weekLabel: {
    fontSize: 9,
    color: '#A5A5A5',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    color: '#6C63FF',
    fontSize: 16,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    color: '#FF6584',
    fontSize: 18,
    marginVertical: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#6C63FF',
    fontSize: 18,
    marginTop: 16,
    fontWeight: '600',
  },
  emptyHint: {
    color: '#A5A5A5',
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    borderRadius: 28,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default WeeklyPollinationAdmin;