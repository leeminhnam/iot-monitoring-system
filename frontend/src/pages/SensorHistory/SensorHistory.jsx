import React, { useState, useEffect } from 'react';
import { Select, Table, Input, message, Typography } from 'antd';
import { io } from 'socket.io-client';
import sensorApi from '../../services/sensorApi';
import './SensorHistory.css';

const { Text } = Typography;

export default function SensorHistory() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(null);

  const [filters, setFilters] = useState({
    time: '',
    sensorType: '',
    value: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        ...(filters.time && { time: filters.time }),
        ...(filters.sensorType && { sensorType: filters.sensorType }),
        ...(filters.value && { value: filters.value }),
        ...(sortOrder && { sortBy: 'value', sortOrder })
      };

      const response = await sensorApi.getSensorData(params);
      const payload = response.data;
      setData(payload.data || []);
      setTotal(payload.total || 0);
      setTotalPages(payload.totalPages || 1);
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi tải dữ liệu cảm biến');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, limit, filters, sortOrder]);

  const handleSortValue = () => {
    setSortOrder(prev => {
      if (prev === null) return 'asc';
      if (prev === 'asc') return 'desc';
      return null;
    });
    setPage(1);
  };

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('sensor_data_new', (newRecords) => {
      const hasFilter = filters.time || filters.sensorType || filters.value;
      if (page !== 1 || hasFilter) return;

      setData(prev => {
        const updated = [...newRecords.reverse(), ...prev];
        return updated.slice(0, limit);
      });
      setTotal(prev => prev + newRecords.length);
    });

    return () => {
      socket.off('sensor_data_new');
    };
  }, [page, limit, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const formatValue = (type, value) => {
    if (type === 'temperature') return `${value} °C`;
    if (type === 'humidity') return `${value} %`;
    if (type === 'light') return `${value} lux`;
    if (type === 'rain') return `${value} %`;
    return value;
  };

  const getSensorTypeName = (type) => {
    if (type === 'temperature') return 'Nhiệt độ';
    if (type === 'humidity') return 'Độ ẩm';
    if (type === 'light') return 'Ánh sáng';
    if (type === 'rain') return 'Độ mưa';
    return type;
  };

  const getClassName = (type) => {
    if (type === 'temperature') return 'nhiet-do';
    if (type === 'humidity') return 'do-am';
    if (type === 'light') return 'anh-sang';
    if (type === 'rain') return 'do-mua';
    return '';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const pad = (n) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Loại cảm biến',
      dataIndex: 'sensorType',
      key: 'sensorType',
      render: (text) => <span className={`type-${getClassName(text)}`}>{getSensorTypeName(text)}</span>,
    },
    {
      title: (
        <span className="sort-header" onClick={handleSortValue}>
          Giá trị
          <span className="sort-icons">
            <span className={`sort-arrow sort-asc${sortOrder === 'asc' ? ' active' : ''}`}>▲</span>
            <span className={`sort-arrow sort-desc${sortOrder === 'desc' ? ' active' : ''}`}>▼</span>
          </span>
        </span>
      ),
      dataIndex: 'value',
      key: 'value',
      render: (value, record) => (
        <span className={`value-${getClassName(record.sensorType)}`}>
          {formatValue(record.sensorType, value)}
        </span>
      ),
    },
    {
      title: 'Thời gian',
      dataIndex: 'time',
      key: 'time',
      render: (time) => {
        const formatted = formatDate(time);
        if (!formatted) return '';
        return (
          <Text
            copyable={{
              text: formatted,
              tooltips: ['Sao chép', 'Đã sao chép!'],
            }}
            style={{ color: 'inherit' }}
          >
            {formatted}
          </Text>
        );
      },
    },
  ];

  return (
    <div className="sensor-history-container">
      <div className="filters-row">
        <Select
          className="filter-select"
          placeholder="Chọn loại cảm biến"
          value={filters.sensorType || undefined}
          allowClear
          onChange={(value) => {
            setFilters(prev => ({ ...prev, sensorType: value || '' }));
            setPage(1);
          }}
          options={[
            { value: 'temperature', label: 'Nhiệt độ' },
            { value: 'humidity', label: 'Độ ẩm' },
            { value: 'light', label: 'Ánh sáng' },
            { value: 'rain', label: 'Độ mưa' }
          ]}
        />

        <Input
          name="value"
          placeholder="Giá trị cảm biến ...."
          className="filter-input"
          value={filters.value}
          onChange={handleFilterChange}
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