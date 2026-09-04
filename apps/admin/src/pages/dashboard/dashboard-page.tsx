import { formatDate } from '@hyunwoo/shared/lib'
import { Badge, Progress, Table, TableBody, TableCell, TableRow } from '@hyunwoo/ui'
import { Clock, Database, Eye, FileCheck, FileText, LayoutGrid, Link2, Server, Users } from 'lucide-react'
import {
  REFERRER_CATEGORY_COLORS,
  REFERRER_CATEGORY_LABELS,
  ReferrerPieChart,
  useAdminLogs,
  useDashboard,
  usePopularPosts,
  useReferrers,
  useSystemInfo,
  useVisitors,
} from '@/entities/analytics'
import { DashboardCard, EmptyState, RingProgress, StatCard } from '@/shared/ui'
import { VisitorsTimelineCard } from './visitors-timeline-card'

export function DashboardPage() {
  const { data: dashboard } = useDashboard()
  const { data: visitors } = useVisitors(30, 'blog')
  const { data: todayVisitors } = useVisitors(1, 'blog')
  const { data: totalVisitors } = useVisitors(undefined, 'blog')
  const { data: popularPosts } = usePopularPosts(5)
  const { data: referrers } = useReferrers(30, 'blog')
  const { data: adminLogs } = useAdminLogs(5)
  const { data: system } = useSystemInfo()

  const stats = dashboard.postStats
  const memoryPercent = Math.round((system.memory.heapUsed / system.memory.heapTotal) * 100)

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={<FileText size={20} />} label="전체 포스트" value={stats.total} color="blue" />
        <StatCard icon={<FileCheck size={20} />} label="발행됨" value={stats.published} color="teal" />
        <StatCard icon={<Eye size={20} />} label="오늘 방문자" value={todayVisitors.uniqueVisitors} color="violet" />
        <StatCard icon={<Users size={20} />} label="30일 방문자" value={visitors.uniqueVisitors} color="indigo" />
        <StatCard icon={<Users size={20} />} label="누적 방문자" value={totalVisitors.uniqueVisitors} color="cyan" />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8">
          <DashboardCard icon={<LayoutGrid size={16} />} title="카테고리 분포" iconColor="blue">
            {!dashboard?.categoryStats.length ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-2.5 max-h-[200px] overflow-y-auto">
                {dashboard.categoryStats.map(cat => {
                  const percent = stats.total > 0 ? Math.round((cat.count / stats.total) * 100) : 0
                  return (
                    <div key={cat.category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cat.category}</span>
                        <span className="text-xs text-muted-foreground">
                          {cat.count}개 ({percent}%)
                        </span>
                      </div>
                      <Progress value={percent} />
                    </div>
                  )
                })}
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="col-span-12 md:col-span-4">
          <DashboardCard icon={<Server size={16} />} title="서버 상태" iconColor="cyan">
            <div className="flex flex-col items-center gap-3">
              <RingProgress
                value={memoryPercent}
                size={100}
                thickness={10}
                color={memoryPercent > 80 ? 'text-red-500' : 'text-cyan-500'}
                label={<span className="text-base font-bold">{memoryPercent}%</span>}
              />
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-xs text-muted-foreground">
                  힙: {system.memory.heapUsed}MB / {system.memory.heapTotal}MB
                </span>
                <span className="text-xs text-muted-foreground">RSS: {system.memory.rss}MB</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={system.database === 'ok' ? 'secondary' : 'destructive'} className="gap-1 text-xs">
                  <Database size={10} />
                  DB {system.database}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {system.uptimeFormatted}
                </Badge>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <DashboardCard icon={<Eye size={16} />} title="인기 포스트" iconColor="violet">
            {!popularPosts?.length ? (
              <EmptyState />
            ) : (
              <div className="max-h-[220px] overflow-y-auto -mx-6">
                <Table>
                  <TableBody>
                    {popularPosts.map((post, i) => (
                      <TableRow key={post.slug}>
                        <TableCell className="w-[30px]">
                          <Badge
                            className={`rounded-full size-5 justify-center text-xs ${i < 3 ? 'bg-violet-500' : 'bg-muted-foreground'}`}
                          >
                            {i + 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm line-clamp-1">{post.title}</span>
                        </TableCell>
                        <TableCell className="w-[70px] text-right">
                          <span className="text-xs text-muted-foreground font-mono">
                            {post.viewCount.toLocaleString()}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <DashboardCard icon={<FileText size={16} />} title="최근 포스트" iconColor="teal">
            {!dashboard?.recentPosts.length ? (
              <EmptyState />
            ) : (
              <div className="max-h-[220px] overflow-y-auto -mx-6">
                <Table>
                  <TableBody>
                    {dashboard.recentPosts.map(post => (
                      <TableRow key={post.slug}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm line-clamp-1">{post.title}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                {post.category}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="w-[60px] text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <Eye size={12} className="text-muted-foreground" />
                            <span className="text-xs text-muted-foreground font-mono">
                              {post.viewCount.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-6">
          <DashboardCard icon={<Link2 size={16} />} title="유입 경로 (30일)" iconColor="orange">
            {!referrers?.summary.total ? (
              <EmptyState />
            ) : (
              <div className="flex flex-col gap-4">
                <ReferrerPieChart summary={referrers.summary} />
                <div className="max-h-[140px] overflow-y-auto -mx-6">
                  <Table>
                    <TableBody>
                      {referrers.referrers.map(ref => (
                        <TableRow key={ref.source}>
                          <TableCell className="w-[8px]">
                            <span
                              className="size-2 rounded-full block"
                              style={{ backgroundColor: REFERRER_CATEGORY_COLORS[ref.category] }}
                              aria-hidden="true"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-sm">{ref.source}</span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                                style={{
                                  backgroundColor: `${REFERRER_CATEGORY_COLORS[ref.category]}20`,
                                  color: REFERRER_CATEGORY_COLORS[ref.category],
                                }}
                              >
                                {REFERRER_CATEGORY_LABELS[ref.category]}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="w-[50px] text-right">
                            <span className="text-xs text-muted-foreground font-mono">{ref.count}</span>
                          </TableCell>
                          <TableCell className="w-[100px]">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${ref.percentage}%`,
                                    backgroundColor: REFERRER_CATEGORY_COLORS[ref.category],
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-muted-foreground font-mono w-[32px] text-right">
                                {ref.percentage}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DashboardCard>
        </div>

        <div className="col-span-12 md:col-span-6">
          <DashboardCard icon={<Clock size={16} />} title="관리자 활동" iconColor="gray">
            {!adminLogs?.length ? (
              <EmptyState label="활동 없음" />
            ) : (
              <div className="max-h-[300px] overflow-y-auto -mx-6">
                <Table>
                  <TableBody>
                    {adminLogs.map(log => (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                log.action === 'create'
                                  ? 'bg-teal-900/30 text-teal-400'
                                  : log.action === 'delete'
                                    ? 'bg-red-900/30 text-red-400'
                                    : 'bg-blue-900/30 text-blue-400'
                              }`}
                            >
                              {log.action}
                            </Badge>
                            <span className="text-sm">
                              {log.entity} #{log.entityId}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="w-[100px] text-right">
                          <span className="text-xs text-muted-foreground">{formatDate(log.createdAt)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </DashboardCard>
        </div>
      </div>

      <VisitorsTimelineCard />
    </div>
  )
}
