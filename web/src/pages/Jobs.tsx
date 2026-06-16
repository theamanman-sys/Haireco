import { useEffect, useState } from 'react';
import api from '../services/api';
import { Briefcase, MapPin, Clock, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslate } from '../i18n/useTranslate';

interface JobSummary {
  id: string;
  title: string;
  description: string;
  jobType: string;
  location: string;
  salaryRange?: string;
  createdAt: string;
  salon: { name: string; city: string; logo: string };
  _count: { applications: number };
}

export default function Jobs() {
  const t = useTranslate();
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [jobType, setJobType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params: any = {};
    if (jobType) params.jobType = jobType;
    api.get('/jobs', { params })
      .then(({ data }) => setJobs(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [jobType]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-6 text-cream" style={{ fontFamily: "'Playfair Display', serif" }}>{t('jobs.title')}</h1>
      <div className="flex flex-wrap gap-2 mb-8">
        {['', 'FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE', 'INTERNSHIP'].map((type) => (
          <button key={type} onClick={() => setJobType(type)} className={`px-4 py-1.5 rounded text-xs tracking-widest uppercase transition-all duration-300 ${jobType === type ? 'bg-primary-600 text-white' : 'text-cream/55 border border-white/10 hover:border-primary-600/30'}`}>
            {type.replace('_', ' ') || t('jobs.all')}
          </button>
        ))}
      </div>
      {loading ? (
        <p className="text-cream/55">{t('jobs.loading')}</p>
      ) : jobs.length === 0 ? (
        <p className="text-cream/55">{t('jobs.noneFound')}</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link to={`/jobs/${job.id}`} key={job.id} className="card block hover:shadow-2xl transition-all duration-300 hover:border-primary-600/30 group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg text-cream group-hover:text-primary-600 transition-colors">{job.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-cream/55">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{job.salon.name}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.jobType.replace('_', ' ')}</span>
                    {job.salaryRange && <span className="font-medium text-primary-600">{job.salaryRange}</span>}
                  </div>
                </div>
                <span className="text-xs text-cream/40">{job._count.applications} {t('jobs.applicants')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
