/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community
 * Edition) available.
 * Copyright (C) 2017 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
(function () {
    function getScriptContent(language) {
        // {value: "1", name: "shell"},
        // {value: "2", name: "bat"},
        // {value: "3", name: "perl"},
        // {value: "4", name: "python"},
        // {value: "5", name: "powershell"}
        // bash
        if (language === "1") {
            return gettext(`#!/bin/bash

anynowtime="date +'%Y-%m-%d %H:%M:%S'"
NOW="echo [\\\`$anynowtime\\\`][PID:$$]"

##### 可在脚本开始运行时调用，打印当时的时间戳及PID。
function job_start
{
    echo "\`eval $NOW\` job_start"
}

##### 可在脚本执行成功的逻辑分支处调用，打印当时的时间戳及PID。 
function job_success
{
    MSG="$*"
    echo "\`eval $NOW\` job_success:[$MSG]"
    exit 0
}

##### 可在脚本执行失败的逻辑分支处调用，打印当时的时间戳及PID。
function job_fail
{
    MSG="$*"
    echo "\`eval $NOW\` job_fail:[$MSG]"
    exit 1
}

job_start

###### 作业平台中执行脚本成功和失败的标准只取决于脚本最后一条执行语句的返回值
###### 如果返回值为0，则认为此脚本执行成功，如果非0，则认为脚本执行失败
###### 可在此处开始编写您的脚本逻辑代码

`)
        } else if (language === "2") {
            return gettext(`@echo on
setlocal enabledelayedexpansion
call:job_start

REM 作业平台中执行脚本成功和失败的标准只取决于脚本最后一条执行语句的返回值
REM 如果返回值为0，则认为此脚本执行成功，如果非0，则认为脚本执行失败
REM 可在此处开始编写您的脚本逻辑代码



REM 函数自定义区域，不要把正文写到函数区下面 
goto:eof
REM 可在脚本开始运行时调用，打印当时的时间戳及PID。
:job_start
    set cu_time=[%date:~0,10% %time:~0,8%]
    for /F "skip=3 tokens=2" %%i in ('tasklist /v /FI "IMAGENAME eq cmd.exe" /FI "STATUS eq Unknown"') do (
        set pid=[PID:%%i]
        goto:break
    )
    :break
    echo %cu_time%%pid% job_start
    goto:eof
    
REM 可在脚本执行成功的逻辑分支处调用，打印当时的时间戳及PID。 
:job_success
    set cu_time=[%date:~0,10% %time:~0,8%]
    for /F "skip=3 tokens=2" %%i in ('tasklist /v /FI "IMAGENAME eq cmd.exe" /FI "STATUS eq Unknown"') do (
        set pid=[PID:%%i]
        goto:break
    )
    :break
    echo %cu_time%%pid% job_success:[%*]
    exit 0
    
REM 可在脚本执行失败的逻辑分支处调用，打印当时的时间戳及PID。
:job_fail
    set cu_time=[%date:~0,10% %time:~0,8%]
    for /F "skip=3 tokens=2" %%i in ('tasklist /v /FI "IMAGENAME eq cmd.exe" /FI "STATUS eq Unknown"') do (
        set pid=[PID:%%i]
        goto:break
    )
    :break
    echo %cu_time%%pid% job_fail:[%*]
    exit 1
`)
        } else if (language === "3") {
            return gettext(`#!/usr/bin/perl

use strict;

sub job_localtime {
    my @n = localtime();
    return sprintf("%04d-%02d-%02d %02d:%02d:%02d",$n[5]+1900,$n[4]+1,$n[3], $n[2], $n[1], $n[0] );
}

##### 可在脚本开始运行时调用，打印当时的时间戳及PID。
sub job_start {
    print "[",&job_localtime,"][PID:$$] job_start\n";
}

##### 可在脚本执行成功的逻辑分支处调用，打印当时的时间戳及PID。 
sub job_success {
    print "[",&job_localtime,"][PID:$$] job_success:[@_]\n";
    exit 0;
}

##### 可在脚本执行失败的逻辑分支处调用，打印当时的时间戳及PID。
sub job_fail {
    print "[",&job_localtime,"][PID:$$] job_fail:[@_]\n";
    exit 1;
}

job_start;

###### iJobs中执行脚本成功和失败的标准只取决于脚本最后一条执行语句的返回值
###### 如果返回值为0，则认为此脚本执行成功，如果非0，则认为脚本执行失败
###### 可在此处开始编写您的脚本逻辑代码

`)
        } else if (language === "4") {
            return gettext(`#!/usr/bin/env python
# -*- coding: utf8 -*-

import datetime
import os
import sys

def _now(format="%Y-%m-%d %H:%M:%S"):
    return datetime.datetime.now().strftime(format)

##### 可在脚本开始运行时调用，打印当时的时间戳及PID。
def job_start():
    print("[%s][PID:%s] job_start" % (_now(), os.getpid()))

##### 可在脚本执行成功的逻辑分支处调用，打印当时的时间戳及PID。 
def job_success(msg):
    print("[%s][PID:%s] job_success:[%s]" % (_now(), os.getpid(), msg))
    sys.exit(0)

##### 可在脚本执行失败的逻辑分支处调用，打印当时的时间戳及PID。
def job_fail(msg):
    print("[%s][PID:%s] job_fail:[%s]" % (_now(), os.getpid(), msg))
    sys.exit(1)

if __name__ == '__main__':

    job_start()

###### iJobs中执行脚本成功和失败的标准只取决于脚本最后一条执行语句的返回值
###### 如果返回值为0，则认为此脚本执行成功，如果非0，则认为脚本执行失败
###### 可在此处开始编写您的脚本逻辑代码

`)
        } else if (language === "5") {
            return gettext(`##### 可在脚本开始运行时调用，打印当时的时间戳及PID。
function job_start
{
    $cu_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"    
    "[{0}][PID:{1}] job_start" -f $cu_date,$pid
}

##### 可在脚本执行成功的逻辑分支处调用，打印当时的时间戳及PID。 
function job_success
{
    $cu_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    if($args.count -ne 0)
    {
        $args | foreach {$arg_str=$arg_str + " " + $_}
        "[{0}][PID:{1}] job_success:[{2}]" -f $cu_date,$pid,$arg_str.TrimStart(' ')
    }
    else
    {
        "[{0}][PID:{1}] job_success:[]" -f $cu_date,$pid
    }
    exit 0
}

##### 可在脚本执行失败的逻辑分支处调用，打印当时的时间戳及PID。
function job_fail
{
    $cu_date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    if($args.count -ne 0)
    {
        $args | foreach {$arg_str=$arg_str + " " + $_}
        "[{0}][PID:{1}] job_fail:[{2}]" -f $cu_date,$pid,$arg_str.TrimStart(' ')
    }
    else
    {
        "[{0}][PID:{1}] job_fail:[]" -f $cu_date,$pid
    }
    exit 1
}

job_start

###### 作业平台中执行脚本成功和失败的标准只取决于脚本最后一条执行语句的返回值
###### 如果返回值为0，则认为此脚本执行成功，如果非0，则认为脚本执行失败
###### 可在此处开始编写您的脚本逻辑代码

`)
        }
        return ""
    }

    $.atoms.all_biz_job_fast_execute_script = [
        {
            tag_code: "all_biz_cc_id",
            type: "input",
            attrs: {
                name: gettext("业务集ID"),
                hookable: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            },
        },
        {
            tag_code: "job_script_type",
            type: "radio",
            attrs: {
                name: gettext("脚本类型"),
                hookable: true,
                items: [
                    {value: "1", name: "shell"},
                    {value: "2", name: "bat"},
                    {value: "3", name: "perl"},
                    {value: "4", name: "python"},
                    {value: "5", name: "powershell"}
                ],
                default: "1",
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        },
        {
            tag_code: "job_content",
            type: "code_editor",
            attrs: {
                name: gettext("脚本内容"),
                hookable: true,
                placeholder: gettext("填写执行脚本内容"),
                default: getScriptContent("1"),
                language: "shell",
                showLanguageSwitch: false,
                height: "400px",
                validation: [
                    {
                        type: "required"
                    }
                ]
            },
            events: [
                {
                    source: "job_script_type",
                    type: "change",
                    action: function (value) {
                        let content = getScriptContent(value)
                        this.value = content
                    }
                }
            ]
        },
        {
            tag_code: "job_script_param",
            type: "input",
            attrs: {
                name: gettext("脚本参数"),
                placeholder: gettext("可为空, 脚本执行时传入的参数，同脚本在终端执行时的传参格式， 如:./test.sh xxxx xxx xxx"),
                hookable: true
            },
        },
        {
            tag_code: "job_script_timeout",
            type: "input",
            attrs: {
                name: gettext("超时时间"),
                placeholder: gettext("单位为秒(1 - 86400)，为空时使用 JOB 默认值"),
                hookable: true,
                validation: [
                    {
                        type: "custom",
                        args: function (value) {
                            let result = {
                                result: true,
                                error_message: ""
                            };
                            if (!value) {
                                return result
                            }
                            var reg = /^[\d]+$/;
                            if (!reg.test(value)) {
                                result.result = false;
                                result.error_message = gettext("超时时间必须为整数")
                            }
                            if (+value < 1 || +value > 86400) {
                                result.result = false;
                                result.error_message = gettext("超时时间必须在 1 - 86400 范围内")
                            }
                            return result
                        }
                    }
                ]
            }
        },
        {
            tag_code: "job_target_account",
            type: "input",
            attrs: {
                name: gettext("执行账号"),
                placeholder: gettext("请输入在蓝鲸作业平台上注册的账户名"),
                hookable: true,
                validation: [
                    {
                        type: "required"
                    }
                ]
            },
        },
        {
            tag_code: "is_tagged_ip",
            type: "radio",
            attrs: {
                name: gettext("IP Tag 分组"),
                items: [
                    {value: true, name: gettext("是")},
                    {value: false, name: gettext("否")},
                ],
                default: false,
                validation: [
                    {
                        type: "required"
                    }
                ]
            }
        },
        {
            tag_code: "job_target_ip_table",
            type: "datatable",
            attrs: {
                name: gettext("目标服务器"),
                pagination: true,
                placeholder: gettext("请输入IP 地址，多IP可用空格、换行分隔\n 非本业务IP请输入管控区域:IP，并确保已在作业平台添加白名单"),
                hookable: true,
                empty_text: gettext("请输入IP 地址，多IP可用空格、换行分隔, 非本业务IP请输入管控区域:IP，并确保已在作业平台添加白名单"),
                table_buttons: [
                    {
                        type: "add_row",
                        text: gettext("添加"),
                        callback: function () {
                            this.add_row()
                        }
                    },
                    {
                        type: "export",
                        text: gettext("导出"),
                        callback: function () {
                            this.export2Excel()
                        }
                    },
                    {
                        type: "import",
                        text: gettext("导入")
                    }
                ],
                columns: [
                    {
                        tag_code: "bk_cloud_id",
                        type: "input",
                        attrs: {
                            name: gettext("管控区域ID(默认为0)"),
                            validation: [
                                {
                                    type: "required"
                                }
                            ]
                        }
                    },
                    {
                        tag_code: "ip",
                        type: "textarea",
                        attrs: {
                            name: "IP",
                            placeholder: gettext("多个IP以,分隔"),
                            validation: [
                                {
                                    type: "required"
                                }
                            ]
                        }
                    },
                ],

                validation: [
                    {
                        type: "required"
                    }
                ],
            },
        },
        {
            tag_code: "need_log_outputs_even_fail",
            type: "radio",
            attrs: {
                name: gettext("失败时提取变量"),
                items: [
                    {value: true, name: gettext("是")},
                    {value: false, name: gettext("否")},
                ],
                default: false,
                hookable: true,
            }
        },
    ]
})();
