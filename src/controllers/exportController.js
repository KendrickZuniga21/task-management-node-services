const axios = require('axios');

const fastCsv  = require('fast-csv');

const XLSX = require('xlsx');

async function exportTasks(req, res) {

    try {

        const {
            team_id,
            format: exportFormat,
            filters = {}
        } = req.body;

        const token =
            req.headers.authorization
                .split(' ')[1];

        const query =
            new URLSearchParams({
                all: true,
                ...filters
            });

        const endpoint =
            team_id
                ? `${process.env.LARAVEL_API_URL}/teams/${team_id}/tasks?${query}`
                : `${process.env.LARAVEL_API_URL}/tasks?${query}`;

        const response =
            await axios.get(
                endpoint,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`
                    }
                }
            );

        const tasks =
            response.data;

        if (exportFormat === 'json') {
            console.log(
                'Export generated',
                {
                    user_id: req.user.sub,
                    format: exportFormat,
                    team_id
                }
            );
            return res.json(tasks);
        }

        if (exportFormat === 'csv') {

            res.setHeader(
                'Content-Type',
                'text/csv'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=tasks.csv'
            );

            const csvStream =
                fastCsv.format({
                    headers: true
                });

            csvStream.pipe(res);

            tasks.forEach(task => {

                csvStream.write({
                    id: task.id,
                    title: task.title,
                    status: task.status,
                    priority: task.priority,
                    assigned_to:
                        task.assigned_user?.name ||
                        'Unassigned',
                    team:
                        task.team?.name ||
                        'N/A',
                    due_date:
                        task.due_date
                });
            });

            csvStream.end();
            console.log(
                'Export generated',
                {
                    user_id: req.user.sub,
                    format: exportFormat,
                    team_id
                }
            );

            return;
        }

        if (exportFormat === 'xlsx') {

            const exportData =
                tasks.map(task => ({
                    ID: task.id,
                    Title: task.title,
                    Status: task.status,
                    Priority: task.priority,
                    AssignedTo:
                        task.assigned_user?.name ||
                        'Unassigned',
                    Team:
                        task.team?.name ||
                        'N/A',
                    DueDate:
                        task.due_date
                }));

            const worksheet =
                XLSX.utils.json_to_sheet(
                    exportData
                );

            const workbook =
                XLSX.utils.book_new();

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                'Tasks'
            );

            const buffer =
                XLSX.write(
                    workbook,
                    {
                        type: 'buffer',
                        bookType: 'xlsx'
                    }
                );

            res.setHeader(
                'Content-Type',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );

            res.setHeader(
                'Content-Disposition',
                'attachment; filename=tasks.xlsx'
            );

             console.log(
                'Export generated',
                {
                    user_id: req.user.sub,
                    format: exportFormat,
                    team_id
                }
            );

            return res.send(buffer);
        }

        return res.status(422).json({
            message:
                'Format not implemented yet'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message:
                'Export failed',
            error:
                error.message
        });
    }
}

module.exports = {
    exportTasks
};