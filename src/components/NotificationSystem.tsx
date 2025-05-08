'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Badge,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Button,
  Divider,
  Avatar,
  HStack,
  Tooltip,
} from '@chakra-ui/react';
import { BellIcon, CheckIcon, WarningIcon, InfoIcon } from '@chakra-ui/icons';
import { FaCalendarAlt, FaMoneyBillWave, FaUserGraduate } from 'react-icons/fa';
import axios from 'axios';
import { format, isToday, isYesterday } from 'date-fns';

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  createdAt: string;
  isRead: boolean;
  link?: string;
  relatedTo?: {
    type: 'payment' | 'student' | 'fee_structure' | 'system';
    id?: string;
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function NotificationSystem() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700');

  useEffect(() => {
    fetchNotifications();
    
    // Set up polling for new notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      const response = await axios.get(`${API_BASE_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setNotifications(response.data);
      const unread = response.data.filter((notification: Notification) => !notification.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/api/notifications/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(
        notifications.map((notification) =>
          notification._id === id
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return;
      }

      await axios.patch(
        `${API_BASE_URL}/api/notifications/mark-all-read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Update local state
      setNotifications(
        notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy • h:mm a');
    }
  };

  const getNotificationIcon = (type: string, relatedTo?: { type: string }) => {
    if (relatedTo) {
      switch (relatedTo.type) {
        case 'payment':
          return FaMoneyBillWave;
        case 'student':
          return FaUserGraduate;
        case 'fee_structure':
          return FaCalendarAlt;
        default:
          break;
      }
    }
    
    switch (type) {
      case 'success':
        return CheckIcon;
      case 'warning':
        return WarningIcon;
      case 'error':
        return WarningIcon;
      default:
        return InfoIcon;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <>
      <Tooltip label={`${unreadCount} unread notifications`} isDisabled={unreadCount === 0}>
        <Box position="relative" display="inline-block">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            onClick={onOpen}
            variant="ghost"
            position="relative"
          />
          {unreadCount > 0 && (
            <Badge
              colorScheme="red"
              borderRadius="full"
              position="absolute"
              top="-2px"
              right="-2px"
              fontSize="xs"
              minW="18px"
              h="18px"
              textAlign="center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </Tooltip>

      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex justify="space-between" align="center">
              <Text>Notifications</Text>
              {notifications.length > 0 && (
                <Button size="sm" variant="outline" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              )}
            </Flex>
          </DrawerHeader>
          <DrawerBody p={0}>
            {notifications.length === 0 ? (
              <Flex
                direction="column"
                align="center"
                justify="center"
                h="300px"
                p={6}
                textAlign="center"
              >
                <Icon as={BellIcon} boxSize={12} color="gray.400" mb={4} />
                <Text fontWeight="medium" mb={2}>
                  No notifications yet
                </Text>
                <Text color="gray.500" fontSize="sm">
                  When you get notifications, they'll show up here
                </Text>
              </Flex>
            ) : (
              <VStack spacing={0} align="stretch">
                {notifications.map((notification) => (
                  <Box
                    key={notification._id}
                    p={4}
                    borderBottomWidth="1px"
                    borderColor={borderColor}
                    bg={notification.isRead ? bgColor : `${getNotificationColor(notification.type)}.50`}
                    _hover={{ bg: hoverBgColor }}
                    transition="background-color 0.2s"
                    onClick={() => {
                      if (!notification.isRead) {
                        markAsRead(notification._id);
                      }
                      if (notification.link) {
                        // Handle navigation to the link
                        window.location.href = notification.link;
                      }
                    }}
                    cursor={notification.link ? 'pointer' : 'default'}
                  >
                    <HStack spacing={3} align="flex-start">
                      <Avatar
                        icon={<Icon as={getNotificationIcon(notification.type, notification.relatedTo)} fontSize="1.5rem" />}
                        bg={`${getNotificationColor(notification.type)}.100`}
                        color={`${getNotificationColor(notification.type)}.700`}
                        size="sm"
                      />
                      <Box flex="1">
                        <Flex justify="space-between" align="flex-start">
                          <Text fontWeight={notification.isRead ? 'normal' : 'bold'}>
                            {notification.title}
                          </Text>
                          <Text fontSize="xs" color="gray.500" ml={2}>
                            {formatNotificationDate(notification.createdAt)}
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color="gray.600" mt={1}>
                          {notification.message}
                        </Text>
                      </Box>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
