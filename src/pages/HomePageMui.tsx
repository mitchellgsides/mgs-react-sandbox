import React from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  Dashboard,
  FitnessCenter,
  Upload,
  CalendarToday,
  TrendingUp,
  Timeline,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h2" component="h1" color="primary" gutterBottom>
          Welcome to Equipped Endurance
        </Typography>
        <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
          Analyze and track your fitness activities with detailed insights
        </Typography>
        <Button
          variant="contained"
          size="large"
          component={RouterLink}
          to="/upload"
          startIcon={<Upload />}
          sx={{ mr: 2, mb: 2 }}
        >
          Upload Activities
        </Button>
        <Button
          variant="outlined"
          size="large"
          component={RouterLink}
          to="/activities"
          startIcon={<FitnessCenter />}
          sx={{ mb: 2 }}
        >
          View Activities
        </Button>
      </Box>

      {/* Features Grid */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flex: 1, textAlign: "center" }}>
              <Timeline sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Activity Analysis
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Upload FIT files and get detailed analysis of your workouts
                including power, heart rate, and performance metrics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flex: 1, textAlign: "center" }}>
              <CalendarToday
                sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
              />
              <Typography variant="h5" component="h3" gutterBottom>
                Calendar View
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Visualize your training schedule and activity history in an
                intuitive calendar interface.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardContent sx={{ flex: 1, textAlign: "center" }}>
              <TrendingUp sx={{ fontSize: 48, color: "primary.main", mb: 2 }} />
              <Typography variant="h5" component="h3" gutterBottom>
                Progress Tracking
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Track your fitness progress over time with comprehensive charts
                and performance analytics.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Quick Actions
          </Typography>
          <List>
            <ListItem
              component={RouterLink}
              to="/activities"
              sx={{
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
                mb: 1,
              }}
            >
              <ListItemIcon>
                <Dashboard color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="View Activities"
                secondary="Browse and analyze your uploaded workout data"
              />
            </ListItem>

            <ListItem
              component={RouterLink}
              to="/upload"
              sx={{
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
                mb: 1,
              }}
            >
              <ListItemIcon>
                <Upload color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Upload FIT Files"
                secondary="Add new workout data from your fitness devices"
              />
            </ListItem>

            <ListItem
              component={RouterLink}
              to="/calendar"
              sx={{
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
                mb: 1,
              }}
            >
              <ListItemIcon>
                <CalendarToday color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Calendar View"
                secondary="See your activities organized by date"
              />
            </ListItem>

            <ListItem
              component={RouterLink}
              to="/profile"
              sx={{
                borderRadius: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
            >
              <ListItemIcon>
                <FitnessCenter color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Profile Settings"
                secondary="Manage your account and preferences"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default HomePage;
