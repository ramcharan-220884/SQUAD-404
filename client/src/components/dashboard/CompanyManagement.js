import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  Plus,
  Download,
  ChevronDown,
  MoreVertical,
  Building,
  Target,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  DollarSign,
  Calendar
} from "lucide-react";

const COMPANIES = [
  { id: 5, name: "Google", description: "Internet", category: "Internet", roles: ["Data Analyst", "Site Reliability Eng."], package: "20 LPA", date: "9 Apr 2026", status: "Open", logo: "https://freelogopng.com/images/all_img/1657952440google-logo-png-transparent.png" },
  { id: 6, name: "Amazon", description: "E-commerce", category: "E-commerce", roles: ["Cloud Engineer", "Backend Developer"], package: "14 LPA", date: "12 Apr 2026", status: "Open", logo: "https://www.tripfiction.com/wp-content/uploads/2016/08/1920x1080-brands-amazon-logo.jpg" },
  { id: 1, name: "TCS", description: "IT Services", category: "IT Services", roles: ["Software Developer"], package: "3.6 LPA", date: "25 Mar 2026", status: "Open", logo: "https://images.ctfassets.net/7xz1x21beds9/4cTq1jt8uh8jnBgvWbpKOV/663b48744791bd4e5ca178ae503d4916/Tata_Consultancy_Services_Logo.svg.png?w=1029&h=1029&q=90&fm=png" },
  { id: 2, name: "Infosys", description: "IT Services", category: "IT Services", roles: ["System Engineer"], package: "4 LPA", date: "28 Mar 2026", status: "Closed", logo: "https://www.infosys.com/content/dam/infosys-web/en/global-resource/media-resources/infosys-logo-png.png" },
  { id: 3, name: "Wipro", description: "IT Services", category: "IT Services", roles: ["Project Engineer"], package: "3.5 LPA", date: "30 Mar 2026", status: "Open", logo: "https://1000logos.net/wp-content/uploads/2021/05/Wipro-logo.png" },
  { id: 4, name: "Cognizant", description: "IT Services", category: "IT Services", roles: ["Test Engineer"], package: "5 LPA", date: "5 Apr 2026", status: "Upcoming", logo: "https://www.energetica-india.net/images/noticias/9UAFMC5ffo8pPCx7qmDyLxFfx9JeaANYVOdhQWCwAaPBMLszOfBlf.jpg" },
  { id: 7, name: "Deloitte", description: "IT Services", category: "Consulting", roles: ["Business Analyst", "System Admin"], package: "7 LPA", date: "15 Apr 2026", status: "Closed", logo: "https://tse3.mm.bing.net/th/id/OIP.CJusanjatQRkym0QHvI9bgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3" }
];

const STATS = [
  { title: "Total Compnies", value: "86", icon: Building, color: "text-emerald-700", bg: "bg-emerald-50" },
  { title: "Active Drives", value: "12", icon: Clock, color: "text-emerald-700", bg: "border-emerald-100" },
  { title: "Students Applied", value: "420", icon: Users, color: "text-emerald-700", bg: "bg-emerald-50" },
  { title: "Students Selected", value: "150", icon: CheckCircle, color: "text-emerald-700", bg: "bg-emerald-50" },
];

export default function CompanyManagement() {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenu && menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenu]);

  const handleAction = (id, action) => {
    console.log(`Company ${id}: ${action}`);
    setActiveMenu(null);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Open":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 text-[11px] font-bold">
            <CheckCircle className="w-3 h-3" /> Open
          </span>
        );
      case "Closed":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-500 text-white rounded-full text-[11px] font-bold">
            <XCircle className="w-3 h-3" /> Closed
          </span>
        );
      case "Upcoming":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full border border-orange-200 text-[11px] font-bold">
            <Clock className="w-3 h-3" /> Upcoming
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Company Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-800 text-white font-semibold rounded-lg hover:bg-emerald-900 transition-all shadow-sm">
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      {/* Modern Filters Row */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-1 gap-4 items-center">
          <div className="flex-1 min-w-[120px]">
            <p className="text-[11px] font-bold text-gray-400 mb-2 ml-1">Industry</p>
            <div className="relative">
              <select className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl outline-none text-sm font-semibold text-gray-600 appearance-none shadow-sm cursor-pointer">
                <option>All</option>
                <option>IT Services</option>
                <option>Internet</option>
                <option>E-commerce</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-w-[120px]">
            <p className="text-[11px] font-bold text-gray-400 mb-2 ml-1">Status</p>
            <div className="relative">
              <select className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl outline-none text-sm font-semibold text-gray-600 appearance-none shadow-sm cursor-pointer">
                <option>All</option>
                <option>Open</option>
                <option>Upcoming</option>
                <option>Closed</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1 min-w-[120px]">
            <p className="text-[11px] font-bold text-gray-400 mb-2 ml-1">Visit Date</p>
            <div className="relative">
              <select className="w-full pl-3 pr-10 py-2.5 bg-white border border-gray-100 rounded-xl outline-none text-sm font-semibold text-gray-600 appearance-none shadow-sm cursor-pointer">
                <option>All</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
        <div className="relative group">
          <button className="flex items-center gap-4 px-4 py-2.5 bg-white border border-gray-100 rounded-xl outline-none text-sm font-semibold text-gray-600 shadow-sm hover:bg-gray-50 transition-all">
            Export <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center gap-4 relative overflow-hidden group hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-xl ${i === 1 ? 'border border-emerald-100' : 'bg-emerald-50/50'} flex items-center justify-center ${stat.color} shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-gray-500 mb-1">{stat.title}</p>
              <h4 className="text-2xl font-black text-gray-900 leading-none">{stat.value}</h4>
            </div>
            {i === 3 && <ChevronRight className="w-4 h-4 text-gray-300 ml-auto" />}
          </div>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative group flex gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by company name or role..."
            className="w-full pl-6 pr-6 py-3.5 bg-white border-2 border-transparent shadow-sm rounded-2xl outline-none focus:border-emerald-500/20 text-sm font-medium placeholder:text-gray-300 transition-all"
          />
        </div>
        <button className="px-10 py-3.5 bg-emerald-800 text-white font-bold rounded-2xl hover:bg-emerald-900 transition-all shadow-md shadow-emerald-900/10 active:scale-95">
          Search
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-gray-400 text-[11px] uppercase tracking-wider font-bold border-b border-gray-50">
                <th className="px-6 py-5 font-bold">Company</th>
                <th className="px-6 py-5 font-bold">Industry</th>
                <th className="px-6 py-5 font-bold text-center">Job Roles</th>
                <th className="px-6 py-5 font-bold text-center">Package</th>
                <th className="px-6 py-5 font-bold text-center">Visit Date</th>
                <th className="px-6 py-5 font-bold text-center">Status</th>
                <th className="px-6 py-5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {COMPANIES.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50/50 transition-all duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center p-1 border border-gray-100 shadow-xs shrink-0">
                        <img
                          src={company.logo}
                          alt={company.name}
                          className="w-full h-full object-contain transition-all group-hover:scale-110"
                          onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + company.name; }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{company.name}</p>
                        <p className="text-[11px] text-gray-400 font-medium">{company.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[12px] font-bold text-gray-500">{company.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center gap-1">
                      {company.roles.map((role, i) => (
                        <span key={i} className="px-3 py-1 bg-gray-100/50 text-gray-500 rounded-lg text-[10px] font-bold whitespace-nowrap">
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[12px] font-bold text-gray-700">{company.package}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[12px] font-bold text-gray-500">{company.date}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {getStatusBadge(company.status)}
                  </td>
                  <td className="px-6 py-4 text-right relative" ref={activeMenu === company.id ? menuRef : null}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenu(activeMenu === company.id ? null : company.id);
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {activeMenu === company.id && (
                      <div className="absolute right-6 top-12 w-44 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 py-2">
                        <button 
                          onClick={() => handleAction(company.id, "View Details")}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Eye className="w-4 h-4" /> View Details
                        </button>
                        <button 
                          onClick={() => handleAction(company.id, "Edit")}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => handleAction(company.id, "Delete")}
                          className="w-full px-4 py-2.5 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-3"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Improved Pagination */}
        <div className="px-6 py-5 border-t border-gray-50 flex items-center justify-between bg-white">
          <p className="text-xs font-bold text-gray-400">
            Showing <span className="text-gray-900">1 to 9 of 85</span> companies
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-gray-400 hover:text-gray-900 transition-colors text-xs font-bold">1</button>
            <button className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold shadow-sm">1</button>
            <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">2</button>
            <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">3</button>
            <span className="px-1 text-gray-300">...</span>
            <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">11</button>
            <button className="w-8 h-8 rounded-lg bg-gray-50 text-gray-600 text-xs font-bold hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200 flex items-center justify-center">1</button>
            <ChevronRight className="w-4 h-4 text-gray-300 mx-2" />
            <div className="flex gap-2 ml-4">
              <button className="w-8 h-8 flex items-center justify-center text-gray-300 border border-gray-100 rounded-lg">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center text-gray-300 border border-gray-100 rounded-lg">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button className="px-4 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-all ml-2">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
