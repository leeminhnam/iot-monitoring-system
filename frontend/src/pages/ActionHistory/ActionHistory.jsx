import React, { useState, useEffect } from 'react';
import { Table, Select, Input, message } from 'antd';
import { io } from 'socket.io-client';
import actionApi from '../../services/actionApi';
import deviceApi from '../../services/deviceApi';
import './ActionHistory.css';

export default function ActionHistory() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState([]);

  const [filters, setFilters] = useState({
    time: '',
    deviceName: '',
    status: '',
    action: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(filters.time && { time: filters.time }),
        ...(filters.deviceName && { deviceName: filters.deviceName }),
        ...(filters.status && { status: filters.status }),
        ...(filters.action && { action: filters.action })
      };

      const response = await actionApi.getActionHistory(params);
      const payload = response.data;
      setData(payload.data || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.totalPages || 1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu lịch sử thiết bị');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, filters]);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const response = await deviceApi.getDevices();
        const deviceList = response.data?.data || response.data || [];
        setDevices(deviceList.map(d => ({
          value: d.name,
          label: d.name,
        })));
      } catch (error) {
        console.error('Lỗi khi tải danh sách thiết bị:', error);
      }
    };
    fetchDevices();
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('action_update', (newAction) => {
      const hasFilter = filters.time || filters.deviceName || filters.status || filters.action;
      if (page !== 1 || hasFilter) return;

      setData(prev => {
        const existingIndex = prev.findIndex(item => item._id === newAction._id);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = newAction;
          return updated;
        }
        const updated = [newAction, ...prev];
        return updated.slice(0, limit);
      });
      setTotal(prev => prev + 1);
    });

    return () => {
      socket.off('action_update');
    };
  }, [page, limit, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const handleSelectChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value || '' }));
    setPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const getStatusConfig = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'success') {
      return { text: 'Thành công', color: '#10b981' };
    }
    if (statusLower === 'pending') {
      return { text: 'Đang thực hiện', color: '#f59e0b' };
    }
    if (statusLower === 'failed') {
      return { text: 'Thất bại', color: '#ef4444' };
    }
    return { text: status || 'Không rõ', color: '#8b92b2' };
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Thiết bị',
      dataIndex: 'deviceId',
      key: 'deviceId',
      render: (device) => <span>{device?.name || 'Không rõ'}</span>,
    },
    {
      title: 'Lệnh',
      dataIndex: 'action',
      key: 'action',
      render: (action) => action === 'turn_on' ? 'Bật' : action === 'turn_off' ? 'Tắt' : action,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const { text, color } = getStatusConfig(status);
        return (
          <div className="status-cell">
            <span style={{ color: color }}>{text}</span>
          </div>
        );
      }
    },
    {
      title: 'Người thực hiện',
      dataIndex: 'userId',
      key: 'userId',
      render: (user) => {
        if (!user) return <span>Không rõ</span>;
        const fullName = [ user.lastName, user.firstName].filter(Boolean).join(' ');
        return <span>{fullName || user.username || 'Không rõ'}</span>;
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (time) => formatDate(time),
    },
  ];

  return (
    <div className="action-history-container">
      <div className="filters-row">
        <Select
          className="filter-select"
          placeholder="Chọn thiết bị"
          value={filters.deviceName || undefined}
          allowClear
          onChange={(value) => handleSelectChange('deviceName', value)}
          options={devices}
        />

        <Select
          className="filter-select"
          placeholder="Trạng thái"
          value={filters.status || undefined}
          allowClear
          onChange={(value) => handleSelectChange('status', value)}
          options={[
            { value: 'success', label: 'Thành công' },
            { value: 'pending', label: 'Đang thực hiện' },
            { value: 'failed', label: 'Thất bại' }
          ]}
        />

        <Select
          className="filter-select"
          placeholder="Lệnh"
          value={filters.action || undefined}
          allowClear
          onChange={(value) => handleSelectChange('action', value)}
          options={[
            { value: 'turn_on', label: 'Bật' },
            { value: 'turn_off', label: 'Tắt' }
          ]}
        />

        <Input
          name="time"
          placeholder="Nhập thời gian ..."
          className="filter-input"
          value={filters.time}
          onChange={handleFilterChange}
        />
      </div>

      <div className="data-table-container">
        <Table
          className="custom-ant-table"
          columns={columns}
          dataSource={data}
          loading={loading}
          rowKey={(record) => record._id || record.id}
          pagination={false}
          locale={{ emptyText: 'Không có dữ liệu' }}
        />

        <div className="pagination-container">
          <div className="page-info">
            Trang {page} / {totalPages || 1}
          </div>

          <div className="items-per-page">
            Hiển thị
            <Select
              className="per-page-select"
              value={limit}
              onChange={(value) => {
                setLimit(value);
                setPage(1);
              }}
              options={[
                { value: 5, label: '5' },
                { value: 10, label: '10' },
                { value: 20, label: '20' },
              ]}
            />
            dòng / trang
          </div>

          <div className="pagination-controls">
            <button
              className="btn-page btn-page-prev"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Trước
            </button>
            <button
              className="btn-page btn-page-next"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}