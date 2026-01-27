import React from 'react';
import { Card, CardContent, Typography, Grid, Box, Chip, LinearProgress } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat, Thermostat, ShowChart, AccessTime } from '@mui/icons-material';

const StatsCard = ({ stats, loading }) => {
  if (loading) {
    return (
      <Card sx={{ minWidth: 300, m: 2 }}>
        <CardContent>
          <LinearProgress />
          <Typography variant="body2" color="text.secondary" align="center">
            Loading statistics...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (!stats || !stats.success) {
    return (
      <Card sx={{ minWidth: 300, m: 2 }}>
        <CardContent>
          <Typography color="error">
            Failed to load statistics
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { period_statistics, trends, records, summary } = stats;

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': case 'rising': return <TrendingUp color="error" />;
      case 'down': case 'falling': return <TrendingDown color="primary" />;
      default: return <TrendingFlat color="action" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'hot': return 'error';
      case 'warm': return 'warning';
      case 'comfortable': return 'success';
      case 'cool': return 'info';
      case 'cold': return 'primary';
      default: return 'default';
    }
  };

  return (
    <Card sx={{ minWidth: 300, maxWidth: 800, m: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          <ShowChart sx={{ verticalAlign: 'middle', mr: 1 }} />
          Temperature Statistics
        </Typography>

        {/* Period Statistics */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          Period Averages
        </Typography>
        <Grid container spacing={2}>
          {period_statistics && Object.entries(period_statistics).map(([period, data]) => (
            data?.average_temperature && (
              <Grid item xs={6} sm={3} key={period}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      {period.replace('_', ' ').toUpperCase()}
                    </Typography>
                    <Typography variant="h6">
                      <Thermostat sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 20 }} />
                      {data.average_temperature}°C
                    </Typography>
                    <Typography variant="caption" display="block">
                      Min: {data.minimum_temperature}°C
                    </Typography>
                    <Typography variant="caption" display="block">
                      Max: {data.maximum_temperature}°C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          ))}
        </Grid>

        {/* Trends */}
        {trends && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Current Trends
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  {getTrendIcon(trends.hourly_trend)}
                  <Box ml={1}>
                    <Typography variant="body1">
                      Hourly Trend: {trends.hourly_trend || 'stable'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Change: {trends.hourly_change ? `${trends.hourly_change}°C` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center">
                  <AccessTime />
                  <Box ml={1}>
                    <Typography variant="body1">
                      Current: {trends.current_hour_average ? `${trends.current_hour_average}°C` : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Previous: {trends.previous_hour_average ? `${trends.previous_hour_average}°C` : 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </>
        )}

        {/* Records */}
        {records && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Temperature Records
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      All Time High
                    </Typography>
                    <Typography variant="h6" color="error">
                      {records.all_time?.highest?.temperature || 'N/A'}°C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      All Time Low
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {records.all_time?.lowest?.temperature || 'N/A'}°C
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}

        {/* Summary */}
        {summary && (
          <>
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              Summary
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              {summary.overall_status && summary.overall_status !== 'unknown' && (
                <Chip
                  label={`Status: ${summary.overall_status}`}
                  color={getStatusColor(summary.overall_status)}
                  size="small"
                />
              )}
              {summary.stability && summary.stability !== 'unknown' && (
                <Chip
                  label={`Stability: ${summary.stability}`}
                  variant="outlined"
                  size="small"
                />
              )}
              {summary.recommendations && summary.recommendations.length > 0 && (
                <Box mt={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Recommendations:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {summary.recommendations.map((rec, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">{rec}</Typography>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          </>
        )}

        {/* Metadata */}
        {stats.metadata && (
          <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
            Data based on {stats.metadata.total_readings} readings | 
            Updated {stats.metadata.data_freshness_minutes} minutes ago | 
            {stats.metadata.is_data_fresh ? ' ✅ Fresh' : ' ⚠️ Stale'}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default StatsCard;