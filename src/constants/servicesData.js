
import React from 'react';
import {
    Hammer,
    Truck,
    Wrench,
    MessageSquare,
    BarChart,
    Eye,
    GraduationCap,
    Briefcase
} from 'lucide-react';

export const PLATFORM_SERVICES = [
    {
        id: 1,
        name_ar: 'خدمة تنفيذ',
        name_en: 'Execution Service',
        description_ar: 'تنفيذ المشاريع الإنشائية والمعمارية بأعلى معايير الجودة والدقة.',
        description_en: 'Execution of construction and architectural projects with the highest quality and precision.',
        icon: Hammer,
        color: '#0071FF'
    },
    {
        id: 2,
        name_ar: 'خدمة توريد',
        name_en: 'Supply Service',
        description_ar: 'توريد أجود المواد والمعدات اللازمة للمشاريع الإنشائية.',
        description_en: 'Supply of high-quality materials and equipment for construction projects.',
        icon: Truck,
        color: '#FFAB00'
    },
    {
        id: 3,
        name_ar: 'عقود صيانه',
        name_en: 'Maintenance Contracts',
        description_ar: 'تقديم خدمات الصيانة الدورية والطارئة لضمان استدامة المنشآت.',
        description_en: 'Providing periodic and emergency maintenance services to ensure facility sustainability.',
        icon: Wrench,
        color: '#36B37E'
    },
    {
        id: 4,
        name_ar: 'إستشارة',
        name_en: 'Consultation',
        description_ar: 'تقديم استشارات مهنية متخصصة في المجالات الهندسية والتقنية.',
        description_en: 'Providing professional specialized consulting in engineering and technical fields.',
        icon: MessageSquare,
        color: '#FF5630'
    },
    {
        id: 5,
        name_ar: 'دراسة مشاريع',
        name_en: 'Project Study',
        description_ar: 'إعداد دراسات جدوى وتحليلات فنية متكاملة للمشاريع قبل البدء.',
        description_en: 'Preparing feasibility studies and integrated technical analysis for projects before starting.',
        icon: BarChart,
        color: '#6554C0'
    },
    {
        id: 6,
        name_ar: 'إشراف مشاريع',
        name_en: 'Project Supervision',
        description_ar: 'الإشراف الفني المباشر على مراحل التنفيذ لضمان مطابقة المواصفات.',
        description_en: 'Direct technical supervision of execution stages to ensure specification compliance.',
        icon: Eye,
        color: '#00B8D9'
    },
    {
        id: 7,
        name_ar: 'تدريب',
        name_en: 'Training',
        description_ar: 'برامج تدريبية متخصصة لتطوير المهارات الهندسية والفنية.',
        description_en: 'Specialized training programs to develop engineering and technical skills.',
        icon: GraduationCap,
        color: '#FF8B00'
    },
    {
        id: 8,
        name_ar: 'إدارة مشاريع',
        name_en: 'Project Management',
        description_ar: 'إدارة متكاملة للمشاريع من التخطيط وحتى التسليم النهائي.',
        description_en: 'Integrated project management from planning to final delivery.',
        icon: Briefcase,
        color: '#253858'
    }
];

export const ServiceIcon = ({ icon: Icon, color, size = 24, framed = true }) => {
    if (!Icon) return null;

    if (!framed) return <Icon size={size} color={color} />;

    return (
        <div
            className="flex items-center justify-center rounded-2xl border-2 transition-all duration-300"
            style={{
                width: size * 2,
                height: size * 2,
                borderColor: `${color}40`,
                backgroundColor: `${color}10`,
                color: color
            }}
        >
            <Icon size={size} strokeWidth={2.5} />
        </div>
    );
};
