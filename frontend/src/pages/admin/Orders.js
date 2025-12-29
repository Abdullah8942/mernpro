import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  HiOutlineSearch, HiOutlineEye, HiOutlineTruck, HiOutlineDownload
} from 'react-icons/hi';
import { orderAPI, getImageUrl } from '../../services/api';
import Loading from '../../components/common/Loading';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const Orders = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusModal, setStatusModal] = useState({ open: false, order: null });

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    page: parseInt(searchParams.get('page')) || 1,
    limit: 10,
  });

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { orderStatus: filters.status }),
      };
      const response = await orderAPI.getAllAdmin(params);
      setOrders(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (err) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      setStatusModal({ open: false, order: null });
      fetchOrders();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const generateOrderPDF = (order) => {
    const doc = new jsPDF();
    
    // Company Header with Logo Style
    doc.setFillColor(139, 69, 19); // Brown/Gold color
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('MERAAB & EMAAN', 105, 22, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Premium Pakistani Fashion', 105, 32, { align: 'center' });
    
    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Invoice Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 15, 55);
    
    // Order Info Box (Right Side)
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(120, 45, 75, 35, 3, 3, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Order #: ${order.orderNumber}`, 125, 54);
    doc.text(`Date: ${formatDate(order.createdAt)}`, 125, 62);
    doc.text(`Status: ${order.orderStatus?.toUpperCase()}`, 125, 70);
    doc.text(`Payment: ${order.paymentMethod === 'cod' ? 'COD' : order.isPaid ? 'Paid' : 'Pending'}`, 125, 78);
    
    // Divider Line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 88, 195, 88);
    
    // Customer Details (Left)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('BILL TO', 15, 98);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const customerName = order.user?.firstName 
      ? `${order.user.firstName} ${order.user.lastName || ''}`
      : `${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}`;
    const customerEmail = order.user?.email || order.shippingAddress?.email || order.guestEmail || 'N/A';
    const customerPhone = order.shippingAddress?.phone || 'N/A';
    
    doc.text(customerName + (order.isGuestOrder ? ' (Guest)' : ''), 15, 106);
    doc.text(customerEmail, 15, 113);
    doc.text(`Phone: ${customerPhone}`, 15, 120);
    
    // Shipping Address (Right)
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    doc.text('SHIP TO', 110, 98);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const addr = order.shippingAddress;
    doc.text(`${addr?.firstName || ''} ${addr?.lastName || ''}`, 110, 106);
    doc.text(`${addr?.street || addr?.addressLine1 || ''}`, 110, 113);
    doc.text(`${addr?.city || ''}, ${addr?.state || ''}`, 110, 120);
    doc.text(`${addr?.postalCode || ''}, ${addr?.country || 'Pakistan'}`, 110, 127);
    
    // Order Items Table
    const tableData = order.items?.map(item => [
      item.name || item.product?.name || item.productName || 'Product',
      item.selectedColor?.name || item.color || '-',
      item.selectedSize || item.size || '-',
      item.quantity || 1,
      `Rs ${(item.price || 0).toLocaleString()}`,
      `Rs ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}`
    ]) || [];
    
    autoTable(doc, {
      startY: 138,
      head: [['Product Name', 'Color', 'Size', 'Qty', 'Unit Price', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [139, 69, 19],
        textColor: 255,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { 
        fontSize: 9,
        cellPadding: 4
      },
      columnStyles: {
        0: { cellWidth: 50, halign: 'left' },
        1: { cellWidth: 25, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 15, halign: 'center' },
        4: { cellWidth: 32, halign: 'right' },
        5: { cellWidth: 32, halign: 'right' }
      },
      alternateRowStyles: {
        fillColor: [250, 250, 250]
      }
    });
    
    // Order Summary Box
    const finalY = (doc.lastAutoTable?.finalY || 180) + 10;
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(120, finalY - 5, 75, 55, 3, 3, 'F');
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const subtotal = order.subtotal || 0;
    const shipping = order.shippingCost || 0;
    const discount = order.discount || 0;
    const total = order.totalAmount || order.grandTotal || 0;
    
    doc.text('Subtotal:', 125, finalY + 5);
    doc.text(`Rs ${subtotal.toLocaleString()}`, 190, finalY + 5, { align: 'right' });
    
    doc.text('Shipping:', 125, finalY + 15);
    doc.text(`Rs ${shipping.toLocaleString()}`, 190, finalY + 15, { align: 'right' });
    
    if (discount > 0) {
      doc.setTextColor(0, 128, 0);
      doc.text('Discount:', 125, finalY + 25);
      doc.text(`-Rs ${discount.toLocaleString()}`, 190, finalY + 25, { align: 'right' });
      doc.setTextColor(0, 0, 0);
    }
    
    doc.setDrawColor(139, 69, 19);
    doc.line(125, finalY + (discount > 0 ? 30 : 20), 190, finalY + (discount > 0 ? 30 : 20));
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(139, 69, 19);
    const totalY = finalY + (discount > 0 ? 40 : 30);
    doc.text('TOTAL:', 125, totalY);
    doc.text(`Rs ${total.toLocaleString()}`, 190, totalY, { align: 'right' });
    
    // Footer
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text('Thank you for shopping with Meraab & Emaan!', 105, 270, { align: 'center' });
    doc.text('Questions? Contact us at support@meraabemaan.com | +92-XXX-XXXXXXX', 105, 277, { align: 'center' });
    doc.text('www.meraabemaan.com', 105, 284, { align: 'center' });
    
    // Save PDF
    doc.save(`Invoice-${order.orderNumber}.pdf`);
    toast.success('Invoice downloaded successfully!');
  };

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Orders</h1>
        <p className="text-sm text-gray-500">Manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search orders..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              className="input pl-10"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
            className="input"
          >
            <option value="">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={filters.limit}
            onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
            className="input"
          >
            <option value="10">10 per page</option>
            <option value="25">25 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6">
            <Loading />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <HiOutlineTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Order</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Payment</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">
                            {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                            {order.isGuestOrder && <span className="ml-1 text-xs bg-yellow-100 text-yellow-700 px-1 rounded">Guest</span>}
                          </p>
                          <p className="text-xs text-gray-500">{order.user?.email || order.shippingAddress?.email || order.guestEmail}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-4 font-medium">
                        {formatPrice(order.grandTotal || order.totalAmount || 0)}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`
                          px-2 py-1 rounded text-xs
                          ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                        `}>
                          {order.paymentMethod === 'cod' ? 'COD' : order.isPaid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-2 text-gray-400 hover:text-primary-600"
                            title="View Details"
                          >
                            <HiOutlineEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => generateOrderPDF(order)}
                            className="p-2 text-gray-400 hover:text-green-600"
                            title="Download PDF"
                          >
                            <HiOutlineDownload className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setStatusModal({ open: true, order })}
                            className="p-2 text-gray-400 hover:text-primary-600"
                            title="Update Status"
                          >
                            <HiOutlineTruck className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(pagination.pages || pagination.totalPages || 1) > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t">
                <p className="text-sm text-gray-500">
                  Showing {((filters.page - 1) * filters.limit) + 1} to{' '}
                  {Math.min(filters.page * filters.limit, pagination.total || 0)} of {pagination.total || 0}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={filters.page === 1}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={filters.page === (pagination.pages || pagination.totalPages || 1)}
                    className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order #${selectedOrder?.orderNumber}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                {selectedOrder.orderStatus}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(selectedOrder.createdAt)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Customer</h4>
                <p>
                  {selectedOrder.user?.firstName 
                    ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName || ''}` 
                    : `${selectedOrder.shippingAddress?.firstName || ''} ${selectedOrder.shippingAddress?.lastName || ''}`}
                  {selectedOrder.isGuestOrder && <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Guest</span>}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.user?.email || selectedOrder.shippingAddress?.email || selectedOrder.guestEmail || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.shippingAddress?.phone || selectedOrder.user?.phone || 'N/A'}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Shipping Address</h4>
                <p>{selectedOrder.shippingAddress?.firstName} {selectedOrder.shippingAddress?.lastName}</p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.shippingAddress?.street || selectedOrder.shippingAddress?.addressLine1}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedOrder.shippingAddress?.country || 'Pakistan'}
                </p>
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-medium mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="w-12 h-14 bg-gray-200 rounded overflow-hidden">
                      <img
                        src={getImageUrl(item.image || item.product?.images?.[0]?.url)}
                        alt={item.name || item.product?.name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/placeholder-product.png';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name || item.product?.name || 'Product'}</p>
                      <p className="text-xs text-gray-500">
                        {item.selectedSize || item.size || 'N/A'} / Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">{formatPrice((item.price || 0) * (item.quantity || 1))}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(selectedOrder.subtotal || selectedOrder.itemsTotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{formatPrice(selectedOrder.shippingCost || selectedOrder.shippingPrice || 0)}</span>
              </div>
              {(selectedOrder.discount > 0 || selectedOrder.discountAmount > 0) && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(selectedOrder.discount || selectedOrder.discountAmount || 0)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(selectedOrder.grandTotal || selectedOrder.totalAmount || 0)}</span>
              </div>
            </div>

            {/* Download PDF Button */}
            <div className="border-t pt-4">
              <button
                onClick={() => generateOrderPDF(selectedOrder)}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg transition-colors"
              >
                <HiOutlineDownload className="w-5 h-5" />
                Download Invoice PDF
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModal.open}
        onClose={() => setStatusModal({ open: false, order: null })}
        title="Update Order Status"
      >
        {statusModal.order && (
          <div className="space-y-4">
            <p className="text-gray-600">
              Update status for order <strong>#{statusModal.order.orderNumber}</strong>
            </p>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map(status => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(statusModal.order._id, status)}
                  disabled={statusModal.order.orderStatus === status}
                  className={`
                    p-3 rounded-lg border text-center transition-colors
                    ${statusModal.order.orderStatus === status 
                      ? 'border-primary-600 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Orders;
