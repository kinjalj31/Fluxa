'use client'

import React from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText
} from '@mui/material'
import { 
  People, 
  PersonAdd, 
  TrendingUp, 
  Schedule 
} from '@mui/icons-material'
import { useAppSelector } from '@/store'

export const UserStatsCard: React.FC = () => {
  const { stats, loading } = useAppSelector(state => state.user)

  if (loading || !stats) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Card 
      elevation={4}
      sx={{ 
        mb: 3,
        borderRadius: 3,
        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
            <TrendingUp />
          </Avatar>
          <Box>
            <Typography variant="h5" fontWeight={600}>
              User Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overview of user activity and engagement
            </Typography>
          </Box>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      {stats.totalUsers}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Total Users
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <People sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white'
              }}
            >
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Box>
                    <Typography variant="h3" fontWeight={700}>
                      {stats.recentUsers.length}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                      Recent Users
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                    <PersonAdd sx={{ fontSize: 32 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {stats.recentUsers.length > 0 && (
          <Box mt={4}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              🕰️ Recent Activity
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Card elevation={1} sx={{ borderRadius: 2 }}>
              <List sx={{ p: 0 }}>
                {stats.recentUsers.slice(0, 5).map((user, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ py: 2 }}>
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText'
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight={500}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {user.email}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Joined {new Date(user.created_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Schedule color="action" />
                    </ListItem>
                    {index < stats.recentUsers.length - 1 && index < 4 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Card>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}