import { useState } from 'react';
import { Mail, Plus, Play, Pause, Send, MessageSquare, Eye, BarChart2, ChevronRight, Phone, Clock } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  channel: 'EMAIL' | 'WHATSAPP' | 'PHONE' | 'LINKEDIN';
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  createdAt: string;
}

const mockCampaigns: Campaign[] = [
  { id: '1', name: 'Senior React Engineers — Initial Outreach', channel: 'EMAIL', status: 'ACTIVE', totalSent: 85, totalOpened: 62, totalReplied: 18, createdAt: '2024-03-10' },
  { id: '2', name: 'Data Scientists — WhatsApp Follow-up', channel: 'WHATSAPP', status: 'ACTIVE', totalSent: 42, totalOpened: 38, totalReplied: 12, createdAt: '2024-03-12' },
  { id: '3', name: 'VP Eng — Executive Outreach', channel: 'EMAIL', status: 'COMPLETED', totalSent: 15, totalOpened: 12, totalReplied: 7, createdAt: '2024-03-08' },
  { id: '4', name: 'Product Managers — Phone Screen', channel: 'PHONE', status: 'DRAFT', totalSent: 0, totalOpened: 0, totalReplied: 0, createdAt: '2024-03-15' },
];

const channelIcon = { EMAIL: Mail, WHATSAPP: MessageSquare, PHONE: Phone, LINKEDIN: MessageSquare };
const channelColor = { EMAIL: 'text-blue-600 bg-blue-50', WHATSAPP: 'text-green-600 bg-green-50', PHONE: 'text-orange-600 bg-orange-50', LINKEDIN: 'text-sky-600 bg-sky-50' };
const statusColor = { DRAFT: 'text-gray-600 bg-gray-100', ACTIVE: 'text-green-600 bg-green-50', PAUSED: 'text-yellow-600 bg-yellow-50', COMPLETED: 'text-blue-600 bg-blue-50' };

export default function OutreachPage() {
  const [showCreate, setShowCreate] = useState(false);

  const totalSent = mockCampaigns.reduce((s, c) => s + c.totalSent, 0);
  const totalOpened = mockCampaigns.reduce((s, c) => s + c.totalOpened, 0);
  const totalReplied = mockCampaigns.reduce((s, c) => s + c.totalReplied, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Outreach Campaigns</h1>
          <p className="text-gray-500 mt-1">Reach candidates with personalized multi-channel sequences.</p>
        </div>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Messages Sent', value: totalSent.toString(), icon: Send, color: 'text-brand-600 bg-brand-50' },
          { label: 'Opened', value: `${totalOpened} (${totalSent ? Math.round((totalOpened / totalSent) * 100) : 0}%)`, icon: Eye, color: 'text-green-600 bg-green-50' },
          { label: 'Replied', value: `${totalReplied} (${totalSent ? Math.round((totalReplied / totalSent) * 100) : 0}%)`, icon: MessageSquare, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Campaigns', value: mockCampaigns.filter(c => c.status === 'ACTIVE').length.toString(), icon: Play, color: 'text-orange-600 bg-orange-50' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{s.label}</span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon size={16} />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border-2 border-brand-200 p-6 mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Create Outreach Campaign</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Campaign name</label>
              <input className="input w-full" placeholder="e.g., Senior React Engineers — Initial Outreach" />
            </div>
            <div>
              <label className="label">Channel</label>
              <select className="input w-full">
                <option value="EMAIL">Email</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="PHONE">Phone</option>
                <option value="LINKEDIN">LinkedIn</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Message template</label>
              <textarea className="input w-full min-h-[120px]" placeholder="Hi {{name}}, I came across your profile and was impressed by your experience at {{company}}..." />
            </div>
            <div>
              <label className="label">Follow-up after (days)</label>
              <input type="number" className="input w-full" defaultValue={3} />
            </div>
            <div>
              <label className="label">Max follow-ups</label>
              <input type="number" className="input w-full" defaultValue={3} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button className="btn-primary"><Send size={14} /> Create & Launch</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">All Campaigns</h3>
          <div className="flex gap-2">
            {['All', 'Active', 'Draft', 'Completed'].map(f => (
              <button key={f} className="text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 hover:bg-brand-50 hover:text-brand-600 transition-colors">
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-gray-100">
          {mockCampaigns.map(campaign => {
            const ChannelIcon = channelIcon[campaign.channel];
            const openRate = campaign.totalSent ? Math.round((campaign.totalOpened / campaign.totalSent) * 100) : 0;
            const replyRate = campaign.totalSent ? Math.round((campaign.totalReplied / campaign.totalSent) * 100) : 0;
            return (
              <div key={campaign.id} className="px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${channelColor[campaign.channel]}`}>
                  <ChannelIcon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-gray-900 truncate">{campaign.name}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[campaign.status]}`}>
                      {campaign.status.charAt(0) + campaign.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span className="capitalize">{campaign.channel.toLowerCase()}</span>
                    <span>·</span>
                    <span>{campaign.createdAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-shrink-0">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{campaign.totalSent}</div>
                    <div className="text-xs text-gray-400">Sent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{openRate}%</div>
                    <div className="text-xs text-gray-400">Opened</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-brand-600">{replyRate}%</div>
                    <div className="text-xs text-gray-400">Replied</div>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
