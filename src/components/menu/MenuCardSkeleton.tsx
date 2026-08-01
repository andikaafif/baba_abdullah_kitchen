import React from 'react';
import { Card, CardContent, Skeleton, Box } from '@mui/material';

const MenuCardSkeleton: React.FC = () => (
  <Card>
    <Skeleton variant="rectangular" height={180} animation="wave" />
    <CardContent>
      <Skeleton variant="text" sx={{ fontSize: '1.25rem', mb: 1 }} animation="wave" />
      <Skeleton variant="text" animation="wave" />
      <Skeleton variant="text" width="80%" animation="wave" />
      <Box sx={{ mt: 2 }}>
        <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} animation="wave" />
      </Box>
      <Skeleton variant="text" sx={{ fontSize: '1.5rem', mt: 1 }} animation="wave" />
    </CardContent>
    <Box sx={{ px: 2, pb: 2 }}>
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2, mb: 1 }} animation="wave" />
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 2 }} animation="wave" />
    </Box>
  </Card>
);

export default MenuCardSkeleton;
