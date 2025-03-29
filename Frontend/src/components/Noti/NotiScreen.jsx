import React, { useState, useEffect } from 'react';
import { Bell, Calendar, VideoIcon, ClockIcon, FileText, Search, X, User, ChevronDown, ChevronRight, Filter } from 'lucide-react';

const NotiScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  
  // Sample notification data
  const notifications = [
    {
      id: 1,
      type: 'appointment',
      title: 'New Appointment Scheduled',
      description: 'Dr. Sarah Chen - Cardiology Checkup',
      time: '10:30 AM, April 3rd',
      status: 'upcoming',
      unread: true,
      timestamp: '23m',
      dateCreated: new Date(2025, 2, 29, 10, 37)
    },
    {
      id: 2,
      type: 'videoConsultation',
      title: 'Video Consultation Confirmed',
      description: 'Dr. James Wilson - Follow-up Consultation',
      time: '2:00 PM, April 2nd',
      status: 'confirmed',
      unread: true,
      timestamp: '1h',
      dateCreated: new Date(2025, 2, 29, 9, 0)
    },
    {
      id: 3,
      type: 'leave',
      title: 'Leave Application Approved',
      description: 'Medical Leave: March 28 - April 1',
      status: 'approved',
      unread: false,
      timestamp: '2h',
      dateCreated: new Date(2025, 2, 29, 8, 0)
    },
    {
      id: 4,
      type: 'videoConsultation',
      title: 'Video Consultation Rescheduled',
      description: 'Dr. Maria Rodriguez - Therapy Session',
      time: '11:15 AM, April 5th',
      status: 'rescheduled',
      unread: true,
      timestamp: '3h',
      dateCreated: new Date(2025, 2, 29, 7, 0)
    },
    {
      id: 5,
      type: 'appointment',
      title: 'Appointment Reminder',
      description: 'Annual Physical Checkup - City Hospital',
      time: '9:00 AM, April 10th',
      status: 'reminder',
      unread: false,
      timestamp: '1d',
      dateCreated: new Date(2025, 2, 28, 10, 0)
    },
    {
      id: 6,
      type: 'leave',
      title: 'Leave Application Under Review',
      description: 'Personal Leave: April 15 - April 18',
      status: 'pending',
      unread: true,
      timestamp: '1d',
      dateCreated: new Date(2025, 2, 28, 9, 0)
    },
    {
      id: 7,
      type: 'videoConsultation',
      title: 'Video Consultation Booking Confirmed',
      description: 'Dr. John Murphy - Dermatology Consultation',
      time: '3:30 PM, April 8th',
      status: 'confirmed',
      unread: false,
      timestamp: '2d',
      dateCreated: new Date(2025, 2, 27, 14, 0)
    }
  ];
  
  // Sort notifications by date (most recent first) and filter based on search
  useEffect(() => {
    const filtered = notifications
      .filter(notification => {
        if (searchQuery === '') return true;
        
        return (
          notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          notification.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (notification.time && notification.time.toLowerCase().includes(searchQuery.toLowerCase())) ||
          notification.type.toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
      .sort((a, b) => b.dateCreated - a.dateCreated);
    
    setFilteredNotifications(filtered);
  }, [searchQuery]);

  // Get icon based on notification type
  const getIcon = (type) => {
    switch(type) {
      case 'appointment':
        return <Calendar className="h-5 w-5 text-green-600" />;
      case 'videoConsultation':
        return <VideoIcon className="h-5 w-5 text-green-600" />;
      case 'leave':
        return <FileText className="h-5 w-5 text-green-600" />;
      default:
        return <Bell className="h-5 w-5 text-green-600" />;
    }
  };
  
  // Get status badge based on notification status
  const getStatusBadge = (status) => {
    switch(status) {
      case 'upcoming':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Upcoming</span>;
      case 'confirmed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Confirmed</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'rescheduled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Rescheduled</span>;
      case 'reminder':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Reminder</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto border border-gray-200">
      {/* Header */}
      <div className="bg-green-600 p-4 rounded-t-lg">
        <div className="flex justify-between items-center">
          <h1 className="text-white text-xl font-bold">Health Record Notifications</h1>
          <div className="flex space-x-2">
            <button className="bg-white p-2 rounded-full text-green-600">
              <Bell className="h-5 w-5" />
            </button>
            <button className="bg-white p-2 rounded-full text-green-600">
              <User className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Search and filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-green-500 focus:border-green-500 block w-full pl-10 p-2.5"
              placeholder="Search notifications (title, description, status, date...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="relative">
            <button
              className="flex items-center justify-center w-full md:w-auto bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-3">
                  <h3 className="font-medium text-gray-900 mb-2">Filter by Type</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Appointments</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Video Consultations</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Leave Applications</span>
                    </label>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mt-4 mb-2">Filter by Date</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="radio" name="date" className="h-4 w-4 text-green-600" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">All time</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="date" className="h-4 w-4 text-green-600" />
                      <span className="ml-2 text-sm text-gray-700">Today</span>
                    </label>
                    <label className="flex items-center">
                      <input type="radio" name="date" className="h-4 w-4 text-green-600" />
                      <span className="ml-2 text-sm text-gray-700">Last 7 days</span>
                    </label>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mt-4 mb-2">Filter by Status</h3>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" />
                      <span className="ml-2 text-sm text-gray-700">Unread only</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Pending</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-green-600 rounded" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Confirmed</span>
                    </label>
                  </div>
                  
                  <div className="mt-4 flex space-x-2">
                    <button className="px-4 py-2 bg-white border border-gray-300 text-sm rounded-lg text-gray-700 hover:bg-gray-50">
                      Reset
                    </button>
                    <button className="px-4 py-2 bg-green-600 text-sm rounded-lg text-white hover:bg-green-700">
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Counter */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700">All Notifications</span>
            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full">{filteredNotifications.length}</span>
          </div>
          <button className="text-sm text-green-600 hover:text-green-800 font-medium">Mark all as read</button>
        </div>
      </div>
      
      {/* Notification List */}
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-4 hover:bg-gray-50 ${notification.unread ? 'bg-green-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {notification.title}
                      {notification.unread && (
                        <span className="ml-2 inline-block w-2 h-2 bg-green-600 rounded-full"></span>
                      )}
                    </p>
                    <span className="text-xs text-gray-500">{notification.timestamp}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{notification.description}</p>
                  {notification.time && (
                    <div className="flex items-center mt-2">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">{notification.time}</span>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between items-center">
                    {getStatusBadge(notification.status)}
                    <button className="text-green-600 text-xs font-medium flex items-center hover:text-green-700">
                      View Details
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 px-4 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No notifications found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
            <button 
              className="mt-4 px-4 py-2 bg-green-600 text-sm rounded-lg text-white hover:bg-green-700"
              onClick={() => setSearchQuery('')}
            >
              Clear search
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-gray-50 rounded-b-lg border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-sm text-gray-500">
          Showing {filteredNotifications.length} of {notifications.length} notifications
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={filteredNotifications.length === 0}>
            Previous
          </button>
          <button className="px-3 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50" disabled={filteredNotifications.length === 0}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotiScreen;